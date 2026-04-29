#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import subprocess
from pathlib import Path

VERSION = "0.6.0-streaming-tracked-rename-with-second-pass"
DEFAULT_ROOT = "/home/jeramee/.openclaw/workspace/control-repos/tier2/theclaw"

# One contract used for BOTH:
#   1. tracked text/source/config/doc file contents
#   2. tracked file paths / filenames
#
# Order matters: specific/long forms must run before generic openclaw/OpenClaw forms.
REPLACEMENTS: tuple[tuple[bytes, bytes], ...] = (
    # Runtime-home identity first.
    (b".openclaw", b".theclaw"),

    # Old Tier 2 setup names superseded by TheClaw naming.
    (b"OpenClaw Builder", b"TheClaw"),
    (b"Openclaw Builder", b"TheClaw"),
    (b"OPENCLAW BUILDER", b"THECLAW"),
    (b"openclaw-builder", b"theclaw"),
    (b"openclaw_builder", b"theclaw"),
    (b"tier2-openclaw-builder", b"tier2-theclaw"),
    (b"tier2_openclaw_builder", b"tier2_theclaw"),
    (b"tier2_builder", b"tier2_theclaw"),

    # Package/path/scope forms.
    (b"ai.openclaw", b"ai.theclaw"),
    (b"ai/openclaw", b"ai/theclaw"),
    (b"ai\\openclaw", b"ai\\theclaw"),
    (b"com.openclaw", b"com.theclaw"),
    (b"io.openclaw", b"io.theclaw"),
    (b"org.openclaw", b"org.theclaw"),
    (b"@openclaw/", b"@theclaw/"),

    # Core case-preserving brand forms.
    (b"OpenClaw", b"TheClaw"),
    (b"Openclaw", b"Theclaw"),
    (b"OPENCLAW", b"THECLAW"),
    (b"openclaw", b"theclaw"),

    # Spaced forms.
    (b"Open Claw", b"The Claw"),
    (b"open claw", b"the claw"),
    (b"OPEN CLAW", b"THE CLAW"),

    # Hyphenated forms.
    (b"Open-Claw", b"The-Claw"),
    (b"open-claw", b"the-claw"),
    (b"OPEN-CLAW", b"THE-CLAW"),

    # Underscore forms.
    (b"Open_Claw", b"The_Claw"),
    (b"open_claw", b"the_claw"),
    (b"OPEN_CLAW", b"THE_CLAW"),
)

BINARY_CONTENT_SUFFIXES = {
    ".7z", ".a", ".aac", ".aab", ".apk", ".app", ".avif",
    ".bin", ".bmp", ".bz2", ".class", ".db", ".dex", ".dll",
    ".dmg", ".dylib", ".eot", ".exe", ".flac", ".gif", ".gz",
    ".icns", ".ico", ".jar", ".jpeg", ".jpg", ".keystore", ".m4a",
    ".mov", ".mp3", ".mp4", ".otf", ".pdf", ".png", ".so",
    ".sqlite", ".tar", ".tgz", ".ttf", ".war", ".wav", ".webp",
    ".woff", ".woff2", ".xcarchive", ".xz", ".zip",
}

SKIP_PATH_PARTS = {
    ".git", ".theclaw-rename", "node_modules", ".pnpm-store", ".yarn",
    ".turbo", ".next", ".nuxt", "dist", "build", "out", "coverage",
    ".cache", ".pytest_cache", ".mypy_cache", ".ruff_cache", "__pycache__",
    ".venv", "venv", "DerivedData", ".gradle", ".idea", ".vscode-test",
}

LEFTOVER_NEEDLES: tuple[bytes, ...] = tuple(old for old, _new in REPLACEMENTS)


def timestamp() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def run_git(root: Path, args: list[str], *, text: bool = False) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        text=text,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def require_repo(root: Path) -> None:
    if not root.is_dir():
        raise SystemExit(f"STOP: missing repo root: {root}")
    if not (root / ".git").is_dir():
        raise SystemExit(f"STOP: not a git repo: {root}")
    markers = ["package.json", "openclaw.mjs", "theclaw.mjs"]
    if not any((root / marker).exists() for marker in markers):
        raise SystemExit(f"STOP: this does not look like the OpenClaw/TheClaw repo root: {root}")


def has_skipped_part(rel_path: Path) -> bool:
    return bool(set(rel_path.parts) & SKIP_PATH_PARTS)


def tracked_files(root: Path) -> list[Path]:
    result = run_git(root, ["ls-files", "-z"], text=False)
    files: list[Path] = []

    for raw in result.stdout.split(b"\0"):
        if not raw:
            continue
        rel_text = raw.decode("utf-8", errors="surrogateescape")
        rel_path = Path(rel_text)

        if has_skipped_part(rel_path):
            continue

        abs_path = root / rel_path
        if abs_path.exists() and abs_path.is_file():
            files.append(rel_path)

    return files


def is_binary_content_path(path: Path) -> bool:
    suffixes = {suffix.lower() for suffix in path.suffixes}
    return bool(suffixes & BINARY_CONTENT_SUFFIXES)


def looks_rewriteable_content(path: Path) -> bool:
    if path.is_symlink() or not path.is_file():
        return False
    if is_binary_content_path(path):
        return False

    try:
        with path.open("rb") as fh:
            sample = fh.read(8192)
    except OSError:
        return False

    # Avoid corrupting UTF-16 and binary formats.
    if b"\x00" in sample:
        return False

    return True


def replace_bytes(data: bytes) -> tuple[bytes, dict[str, int]]:
    updated = data
    counts: dict[str, int] = {}

    for old, new in REPLACEMENTS:
        count = updated.count(old)
        if count:
            updated = updated.replace(old, new)
            counts[old.decode("utf-8")] = count

    return updated, counts


def rename_path_text(path_text: str) -> str:
    updated = path_text
    for old, new in REPLACEMENTS:
        updated = updated.replace(old.decode("utf-8"), new.decode("utf-8"))
    return updated


def write_jsonl(path: Path, record: dict) -> None:
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, sort_keys=True) + "\n")


def content_pass(
    root: Path,
    files: list[Path],
    report_path: Path,
    *,
    dry_run: bool,
    pass_name: str,
) -> dict:
    summary = {
        f"{pass_name}_tracked_files_checked_for_content": 0,
        f"{pass_name}_content_binary_or_skipped_files": 0,
        f"{pass_name}_content_files_changed": 0,
        f"{pass_name}_content_replacement_total": 0,
    }

    for rel_path in files:
        abs_path = root / rel_path

        if not looks_rewriteable_content(abs_path):
            summary[f"{pass_name}_content_binary_or_skipped_files"] += 1
            continue

        summary[f"{pass_name}_tracked_files_checked_for_content"] += 1

        try:
            original = abs_path.read_bytes()
        except OSError as exc:
            write_jsonl(report_path, {
                "phase": pass_name,
                "path": rel_path.as_posix(),
                "status": "read_error",
                "error": str(exc),
            })
            continue

        updated, counts = replace_bytes(original)
        if updated == original:
            continue

        replacement_total = sum(counts.values())
        summary[f"{pass_name}_content_files_changed"] += 1
        summary[f"{pass_name}_content_replacement_total"] += replacement_total

        write_jsonl(report_path, {
            "phase": pass_name,
            "path": rel_path.as_posix(),
            "status": "would_change" if dry_run else "changed",
            "replacement_total": replacement_total,
            "replacements": counts,
        })

        if not dry_run:
            temp_path = abs_path.with_name(abs_path.name + ".theclaw_tmp")
            temp_path.write_bytes(updated)
            try:
                temp_path.chmod(abs_path.stat().st_mode)
            except OSError:
                pass
            os.replace(temp_path, abs_path)

    return summary


def collect_path_renames(root: Path, files: list[Path]) -> list[tuple[str, str]]:
    planned: list[tuple[str, str]] = []
    target_to_source: dict[str, str] = {}
    tracked_set = {path.as_posix() for path in files}

    for rel_path in files:
        old = rel_path.as_posix()
        new = rename_path_text(old)

        if old == new:
            continue

        if new in target_to_source and target_to_source[new] != old:
            raise SystemExit(f"STOP: path collision: {old} and {target_to_source[new]} -> {new}")

        target_to_source[new] = old
        target_abs = root / new

        if target_abs.exists() and new not in tracked_set:
            raise SystemExit(f"STOP: target already exists: {old} -> {new}")

        planned.append((old, new))

    planned.sort(key=lambda pair: len(Path(pair[0]).parts), reverse=True)
    return planned


def apply_path_renames(root: Path, changes: list[tuple[str, str]], report_path: Path, *, dry_run: bool) -> dict:
    summary = {"path_rename_count": 0}

    for old, new in changes:
        old_abs = root / old
        new_abs = root / new

        write_jsonl(report_path, {
            "phase": "path",
            "old_path": old,
            "new_path": new,
            "status": "would_rename" if dry_run else "renamed",
        })

        summary["path_rename_count"] += 1

        if dry_run:
            continue

        if not old_abs.exists():
            raise SystemExit(f"STOP: source path missing during rename: {old}")

        if new_abs.exists() and old_abs.resolve() != new_abs.resolve():
            raise SystemExit(f"STOP: target exists during rename: {old} -> {new}")

        new_abs.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "mv", "-f", old, new], cwd=root, check=True)

    return summary


def cleanup_empty_dirs(root: Path) -> int:
    removed = 0

    for dirpath, _dirnames, _filenames in os.walk(root, topdown=False):
        current = Path(dirpath)
        if current == root:
            continue

        rel = current.relative_to(root)
        if has_skipped_part(rel):
            continue

        try:
            current.rmdir()
            removed += 1
        except OSError:
            pass

    return removed


def scan_leftover_tracked_content(root: Path, files: list[Path], report_path: Path, *, limit: int) -> dict:
    summary = {
        "leftover_scan_limit": limit,
        "leftover_hits_recorded": 0,
        "leftover_files_recorded": 0,
        "leftover_truncated": False,
    }
    files_with_hits = set()

    for rel_path in files:
        if summary["leftover_hits_recorded"] >= limit:
            summary["leftover_truncated"] = True
            break

        abs_path = root / rel_path

        if not abs_path.exists() or not looks_rewriteable_content(abs_path):
            continue

        try:
            data = abs_path.read_bytes()
        except OSError:
            continue

        for needle in LEFTOVER_NEEDLES:
            count = data.count(needle)
            if not count:
                continue

            files_with_hits.add(rel_path.as_posix())
            write_jsonl(report_path, {
                "phase": "leftover",
                "path": rel_path.as_posix(),
                "needle": needle.decode("utf-8"),
                "count": count,
            })

            summary["leftover_hits_recorded"] += 1
            if summary["leftover_hits_recorded"] >= limit:
                summary["leftover_truncated"] = True
                break

    summary["leftover_files_recorded"] = len(files_with_hits)
    return summary


def git_status_short(root: Path) -> str:
    result = subprocess.run(
        ["git", "status", "--short"],
        cwd=root,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return result.stdout


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rename a local OpenClaw clone into TheClaw.")
    parser.add_argument("--root", default=DEFAULT_ROOT)
    parser.add_argument("--apply", action="store_true", help="Actually rewrite content and rename tracked paths.")
    parser.add_argument("--leftover-limit", type=int, default=500)
    parser.add_argument(
        "--fail-on-leftovers",
        action="store_true",
        help="Exit nonzero when old tokens remain in tracked rewriteable content after all passes.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).expanduser().resolve()
    require_repo(root)

    dry_run = not args.apply
    proof_dir = root / ".theclaw-rename" / timestamp()
    proof_dir.mkdir(parents=True, exist_ok=False)

    report_path = proof_dir / "rename_report.jsonl"
    summary_path = proof_dir / "summary.json"

    initial_files = tracked_files(root)

    content_summary_1 = content_pass(
        root,
        initial_files,
        report_path,
        dry_run=dry_run,
        pass_name="content_pass_1",
    )

    path_changes = collect_path_renames(root, initial_files)
    path_summary = apply_path_renames(root, path_changes, report_path, dry_run=dry_run)

    empty_dirs_removed = 0
    if not dry_run:
        empty_dirs_removed = cleanup_empty_dirs(root)

    # Critical v0.6 fix:
    # Refresh tracked files after path renames and run a second content pass.
    # This catches leftover text cases like sqlite/proxy-capture fixtures after large path rewrites.
    refreshed_files = tracked_files(root)
    content_summary_2 = content_pass(
        root,
        refreshed_files,
        report_path,
        dry_run=dry_run,
        pass_name="content_pass_2_after_path_refresh",
    )

    final_files = tracked_files(root)
    leftover_summary = scan_leftover_tracked_content(root, final_files, report_path, limit=args.leftover_limit)
    status = git_status_short(root)

    summary = {
        "version": VERSION,
        "mode": "dry-run" if dry_run else "apply",
        "root": str(root),
        "proof_dir": str(proof_dir),
        "report_path": str(report_path),
        "replacement_pairs": [
            {"old": old.decode("utf-8"), "new": new.decode("utf-8")}
            for old, new in REPLACEMENTS
        ],
        "initial_tracked_files_seen": len(initial_files),
        "refreshed_tracked_files_seen": len(refreshed_files),
        "final_tracked_files_seen": len(final_files),
        **content_summary_1,
        **path_summary,
        "empty_dirs_removed_after_apply": empty_dirs_removed,
        **content_summary_2,
        **leftover_summary,
        "git_status_short_after": status,
        "notes": [
            "This script rewrites tracked text/source/config/doc contents.",
            "This script renames tracked file paths and filenames with git mv.",
            "This script refreshes tracked files after path renames and runs a second content pass.",
            "Binary file contents are not rewritten to avoid corrupting images, fonts, archives, databases, packages, and compiled assets.",
            "Binary filenames are renamed when the tracked path contains a replacement token.",
            "The .git object database and dependency/cache/generated folders are not scanned.",
        ],
    }

    summary_path.write_text(json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8")

    total_changed_files = (
        summary["content_pass_1_content_files_changed"]
        + summary["content_pass_2_after_path_refresh_content_files_changed"]
    )
    total_replacements = (
        summary["content_pass_1_content_replacement_total"]
        + summary["content_pass_2_after_path_refresh_content_replacement_total"]
    )

    print(f"version={VERSION}")
    print(f"mode={summary['mode']}")
    print(f"root={root}")
    print(f"summary={summary_path}")
    print(f"report={report_path}")
    print(f"initial_tracked_files_seen={summary['initial_tracked_files_seen']}")
    print(f"refreshed_tracked_files_seen={summary['refreshed_tracked_files_seen']}")
    print(f"content_files_changed_total={total_changed_files}")
    print(f"content_replacement_total={total_replacements}")
    print(f"path_rename_count={summary['path_rename_count']}")
    print(f"empty_dirs_removed_after_apply={summary['empty_dirs_removed_after_apply']}")
    print(f"leftover_hits_recorded={summary['leftover_hits_recorded']}")
    print(f"leftover_truncated={summary['leftover_truncated']}")
    print("---- git status --short after ----")
    print(status.rstrip() or "<clean>")

    if dry_run:
        print("DRY RUN ONLY: no source files were modified. Re-run with --apply to apply.")
    else:
        print("APPLY COMPLETE: review git status and the JSONL report before install.")

    if args.fail_on_leftovers and summary["leftover_hits_recorded"]:
        raise SystemExit("STOP: old tokens remain after rename; inspect rename_report.jsonl leftover records.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
