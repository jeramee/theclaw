---
summary: "CLI reference for `theclaw docs` (search the live docs index)"
read_when:
  - You want to search the live TheClaw docs from the terminal
title: "Docs"
---

# `theclaw docs`

Search the live docs index.

Arguments:

- `[query...]`: search terms to send to the live docs index

Examples:

```bash
theclaw docs
theclaw docs browser existing-session
theclaw docs sandbox allowHostControl
theclaw docs gateway token secretref
```

Notes:

- With no query, `theclaw docs` opens the live docs search entrypoint.
- Multi-word queries are passed through as one search request.

## Related

- [CLI reference](/cli)
