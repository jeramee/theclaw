#!/usr/bin/env python3
r"""
Write a filtered tree view of a folder to a file.

Usage:
  python tree.py
  python tree.py /home/jeramee/.openclaw -o openclaw-tree.txt --max-depth 5
  python tree.py . --include-exe
  python tree.py . --exclude-dir .tox --exclude-suffix .dll
"""

import argparse
import os


DEFAULT_EXCLUDED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".idea",
    ".venv",
    "venv",
    "env",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".tox",
    "dist",
    "build",
}

DEFAULT_EXCLUDED_SUFFIXES = {
    ".exe",
    ".egg-info",
    ":zone.identifier",
}


def _normalize_suffix(value):
    value = value.strip().lower()
    if not value:
        return value
    return value if value.startswith(".") else f".{value}"


def _should_skip(entry, excluded_dirs, excluded_suffixes, output_path):
    name = entry.name
    lower_name = name.lower()

    try:
        entry_path = os.path.abspath(entry.path)
    except OSError:
        entry_path = ""

    if output_path and entry_path == output_path:
        return True

    if entry.is_dir(follow_symlinks=False):
        return name in excluded_dirs or any(
            lower_name.endswith(suffix) for suffix in excluded_suffixes
        )

    return any(lower_name.endswith(suffix) for suffix in excluded_suffixes)


def _entries_sorted(path, excluded_dirs, excluded_suffixes, output_path):
    try:
        with os.scandir(path) as it:
            items = [
                entry
                for entry in it
                if not _should_skip(entry, excluded_dirs, excluded_suffixes, output_path)
            ]
    except PermissionError:
        return []

    items.sort(key=lambda entry: (not entry.is_dir(follow_symlinks=False), entry.name.lower()))
    return items


def _draw(
    root,
    out,
    max_depth=None,
    follow_symlinks=False,
    prefix="",
    excluded_dirs=None,
    excluded_suffixes=None,
    output_path=None,
):
    if max_depth is not None and max_depth < 0:
        return

    excluded_dirs = excluded_dirs or set()
    excluded_suffixes = excluded_suffixes or set()

    items = _entries_sorted(root, excluded_dirs, excluded_suffixes, output_path)

    for index, entry in enumerate(items):
        last = index == len(items) - 1
        connector = "└── " if last else "├── "
        line = f"{prefix}{connector}{entry.name}"

        if entry.is_symlink():
            try:
                line += f" -> {os.readlink(entry.path)}"
            except OSError:
                pass

        print(line, file=out)

        if entry.is_dir(follow_symlinks=follow_symlinks):
            new_prefix = prefix + ("    " if last else "│   ")
            next_depth = None if max_depth is None else max_depth - 1

            if next_depth is None or next_depth >= 0:
                _draw(
                    entry.path,
                    out,
                    next_depth,
                    follow_symlinks,
                    new_prefix,
                    excluded_dirs,
                    excluded_suffixes,
                    output_path,
                )


def main():
    parser = argparse.ArgumentParser(description="Print a filtered folder tree to a file.")
    parser.add_argument("path", nargs="?", default=".", help="Root folder to scan. Default: current folder.")
    parser.add_argument("-o", "--out", default="tree.txt", help="Output file. Default: tree.txt.")
    parser.add_argument("--max-depth", type=int, help="Limit recursion depth.")
    parser.add_argument("--follow-symlinks", action="store_true", help="Recurse into symlinked directories.")
    parser.add_argument(
        "--include-exe",
        action="store_true",
        help="Include .exe files. By default, .exe files are excluded.",
    )
    parser.add_argument(
        "--exclude-dir",
        action="append",
        default=[],
        help="Additional directory name to exclude. Can be repeated.",
    )
    parser.add_argument(
        "--exclude-suffix",
        action="append",
        default=[],
        help="Additional file suffix to exclude, such as .dll or .zip. Can be repeated.",
    )

    args = parser.parse_args()

    root = os.path.abspath(args.path)
    output_path = os.path.abspath(args.out)

    excluded_dirs = set(DEFAULT_EXCLUDED_DIRS)
    excluded_dirs.update(args.exclude_dir)

    excluded_suffixes = set(DEFAULT_EXCLUDED_SUFFIXES)
    if args.include_exe:
        excluded_suffixes.discard(".exe")

    excluded_suffixes.update(
        suffix for suffix in (_normalize_suffix(value) for value in args.exclude_suffix) if suffix
    )

    with open(output_path, "w", encoding="utf-8") as file:
        print(root, file=file)
        _draw(
            root,
            file,
            max_depth=args.max_depth,
            follow_symlinks=args.follow_symlinks,
            excluded_dirs=excluded_dirs,
            excluded_suffixes=excluded_suffixes,
            output_path=output_path,
        )

    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
    