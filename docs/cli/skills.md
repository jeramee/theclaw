---
summary: "CLI reference for `theclaw skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from ClawHub
  - You want to debug missing binaries/env/config for skills
title: "Skills"
---

# `theclaw skills`

Inspect local skills and install/update skills from ClawHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- ClawHub installs: [ClawHub](/tools/clawhub)

## Commands

```bash
theclaw skills search "calendar"
theclaw skills search --limit 20 --json
theclaw skills install <slug>
theclaw skills install <slug> --version <version>
theclaw skills install <slug> --force
theclaw skills install <slug> --agent <id>
theclaw skills update <slug>
theclaw skills update --all
theclaw skills update --all --agent <id>
theclaw skills list
theclaw skills list --eligible
theclaw skills list --json
theclaw skills list --verbose
theclaw skills list --agent <id>
theclaw skills info <name>
theclaw skills info <name> --json
theclaw skills info <name> --agent <id>
theclaw skills check
theclaw skills check --json
theclaw skills check --agent <id>
```

`search`/`install`/`update` use ClawHub directly and install into the active
workspace `skills/` directory. `list`/`info`/`check` still inspect the local
skills visible to the current workspace and config. Workspace-backed commands
resolve the target workspace from `--agent <id>`, then the current working
directory when it is inside a configured agent workspace, then the default
agent.

This CLI `install` command downloads skill folders from ClawHub. Gateway-backed
skill dependency installs triggered from onboarding or Skills settings use the
separate `skills.install` request path instead.

Notes:

- `search [query...]` accepts an optional query; omit it to browse the default
  ClawHub search feed.
- `search --limit <n>` caps returned results.
- `install --force` overwrites an existing workspace skill folder for the same
  slug.
- `--agent <id>` targets one configured agent workspace and overrides current
  working directory inference.
- `update --all` only updates tracked ClawHub installs in the active workspace.
- `list` is the default action when no subcommand is provided.
- `list`, `info`, and `check` write their rendered output to stdout. With
  `--json`, that means the machine-readable payload stays on stdout for pipes
  and scripts.

## Related

- [CLI reference](/cli)
- [Skills](/tools/skills)
