---
summary: "CLI reference for `theclaw backup` (create local backup archives)"
read_when:
  - You want a first-class backup archive for local TheClaw state
  - You want to preview which paths would be included before reset or uninstall
title: "Backup"
---

# `theclaw backup`

Create a local backup archive for TheClaw state, config, auth profiles, channel/provider credentials, sessions, and optionally workspaces.

```bash
theclaw backup create
theclaw backup create --output ~/Backups
theclaw backup create --dry-run --json
theclaw backup create --verify
theclaw backup create --no-include-workspace
theclaw backup create --only-config
theclaw backup verify ./2026-03-09T00-00-00.000Z-theclaw-backup.tar.gz
```

## Notes

- The archive includes a `manifest.json` file with the resolved source paths and archive layout.
- Default output is a timestamped `.tar.gz` archive in the current working directory.
- If the current working directory is inside a backed-up source tree, TheClaw falls back to your home directory for the default archive location.
- Existing archive files are never overwritten.
- Output paths inside the source state/workspace trees are rejected to avoid self-inclusion.
- `theclaw backup verify <archive>` validates that the archive contains exactly one root manifest, rejects traversal-style archive paths, and checks that every manifest-declared payload exists in the tarball.
- `theclaw backup create --verify` runs that validation immediately after writing the archive.
- `theclaw backup create --only-config` backs up just the active JSON config file.

## What gets backed up

`theclaw backup create` plans backup sources from your local TheClaw install:

- The state directory returned by TheClaw's local state resolver, usually `~/.theclaw`
- The active config file path
- The resolved `credentials/` directory when it exists outside the state directory
- Workspace directories discovered from the current config, unless you pass `--no-include-workspace`

Model auth profiles are already part of the state directory under
`agents/<agentId>/agent/auth-profiles.json`, so they are normally covered by the
state backup entry.

If you use `--only-config`, TheClaw skips state, credentials-directory, and workspace discovery and archives only the active config file path.

TheClaw canonicalizes paths before building the archive. If config, the
credentials directory, or a workspace already live inside the state directory,
they are not duplicated as separate top-level backup sources. Missing paths are
skipped.

The archive payload stores file contents from those source trees, and the embedded `manifest.json` records the resolved absolute source paths plus the archive layout used for each asset.

Installed plugin source and manifest files under the state directory's
`extensions/` tree are included, but their nested `node_modules/` dependency
trees are skipped. Those dependencies are rebuildable install artifacts; after
restoring an archive, use `theclaw plugins update <id>` or reinstall the plugin
with `theclaw plugins install <spec> --force` when a restored plugin reports
missing dependencies.

## Invalid config behavior

`theclaw backup` intentionally bypasses the normal config preflight so it can still help during recovery. Because workspace discovery depends on a valid config, `theclaw backup create` now fails fast when the config file exists but is invalid and workspace backup is still enabled.

If you still want a partial backup in that situation, rerun:

```bash
theclaw backup create --no-include-workspace
```

That keeps state, config, and the external credentials directory in scope while
skipping workspace discovery entirely.

If you only need a copy of the config file itself, `--only-config` also works when the config is malformed because it does not rely on parsing the config for workspace discovery.

## Size and performance

TheClaw does not enforce a built-in maximum backup size or per-file size limit.

Practical limits come from the local machine and destination filesystem:

- Available space for the temporary archive write plus the final archive
- Time to walk large workspace trees and compress them into a `.tar.gz`
- Time to rescan the archive if you use `theclaw backup create --verify` or run `theclaw backup verify`
- Filesystem behavior at the destination path. TheClaw prefers a no-overwrite hard-link publish step and falls back to exclusive copy when hard links are unsupported

Large workspaces are usually the main driver of archive size. If you want a smaller or faster backup, use `--no-include-workspace`.

For the smallest archive, use `--only-config`.

## Related

- [CLI reference](/cli)
