<p align="center">
  <img src="./TheClaw.jpg" alt="Baron von Raschke demonstrating the claw" width="360">
</p>

<p align="center">
  <em>File: Baron von Raschke 1973.jpg</em><br>
  Source: Wikimedia Commons<br>
  Status: Public domain in the United States<br>
  Reason: Published in the U.S. between 1931 and 1977 without copyright notice
</p>

# theclaw

A blunt runtime-renaming tool for developers who looked at aliases, wrappers, shared state, profile juggling, mystery folders, and fragile runtime assumptions and said:

> No.

This is not “The Claw” as a wrestling hold.

This is `theclaw`: a practical local-runtime rename experiment for cloning an upstream tool and giving it a separate command, package identity, runtime home, and heartbeat.

For the original upstream documentation preserved with this snapshot, see:

[Open Claw style README with the renames for simplicity.](README.openclaw-original.md)

For the most up-to-date upstream OpenClaw project, see:

[openclaw/openclaw on GitHub](https://github.com/openclaw/openclaw)

The basic idea is simple:

```text
openclaw  -> theclaw
OpenClaw  -> TheClaw
OPENCLAW  -> THECLAW
.openclaw -> .theclaw
```

Clone it.  
Rename it.  
Isolate it.  
Run it.

No committee required.

---

## The Short Version

If you want a clean public snapshot and do not want to publish inherited upstream history, do not accidentally push the original `.git` folder.

The careful version is:

```text
copy the renamed working tree into a fresh folder without .git
initialize a new repository
commit one clean snapshot
push that clean snapshot
```

The plain-English version is:

```text
delete .git from the publish copy
make a new git repo
go from there
```

Git is powerful, but publishing a renamed runtime can get annoying fast if you accidentally carry old history, old remotes, old author metadata, or generated build artifacts.

For this use case, a clean snapshot repo is often less painful than trying to surgically repair inherited history.

---

## Dedication

Dedicated to the hard-working men and women of old-school professional wrestling:

The grapplers, bump-takers, road warriors, carnival philosophers, and ring generals who understood something modern software occasionally forgets:

Sometimes the answer is not another abstraction layer.

Sometimes you do not negotiate with namespace sprawl.

Sometimes you do not open a committee.

Sometimes you grab the runtime by the forehead, piece it up, apply an unreasonable amount of pressure to the temples, and rename every occurrence of the name until it submits.

No wrestlers were harmed in the making of this script.

No runtimes were harmed either, although one of them did wake up in a separate home directory with a new name and a thousand-yard stare.

---

## The Philosophy

Bruce Lee said:

> “I do not hit. It hits all by itself.”

He was obviously talking about `theclaw`.

The script does not argue.

The script does not posture.

The script does not attend a governance meeting about runtime identity.

It sees `openclaw`.

It becomes `theclaw`.

It hits all by itself.

---

## The Move They Watered Down

Legend says the old-school claw hold was so dangerous, so theatrical, and so deeply unreasonable that the modern era had to file the edges off and pretend everyone wanted safer, softer, more brand-compliant wrestling.

Software did the same thing.

Now every problem gets a wrapper.

Every wrapper gets a config profile.

Every config profile gets shared state.

Every shared state folder gets haunted.

Well, guess what?

I am not coding all that.

I am not even wasting AI tokens having an agent code all that.

`theclaw` is for people who want the old-school solution:

```text
fresh clone
case-preserving rename
separate command
separate package identity
separate runtime home
separate heartbeat
```

If aliases are too soft, wrappers are too cute, and shared runtime state keeps kicking out at two, `theclaw` finishes the match.

---

## What This Actually Does

This script is for a specific use case:

- You have an upstream runtime that already works.
- You want a second local runtime with a different command.
- You want a different package identity.
- You want a different runtime home.
- You want a different heartbeat or runtime state surface.
- You do not want a thin alias that still points into the same identity assumptions.
- You do not want shared config files quietly confusing two separate execution lanes.

It performs a case-preserving rewrite across tracked files and tracked paths:

```text
OpenClaw                   -> TheClaw
Openclaw                   -> Theclaw
OPENCLAW                   -> THECLAW
openclaw                   -> theclaw
.openclaw                  -> .theclaw
openclaw-builder           -> theclaw
openclaw_builder           -> theclaw
tier2-openclaw-builder     -> tier2-theclaw
tier2_openclaw_builder     -> tier2_theclaw
tier2_builder              -> tier2_theclaw
```

It uses Git-tracked files so it does not crawl the `.git` object database, dependency folders, cache folders, build output, or other sludge.

It rewrites text/source/config/doc files, renames tracked paths, refreshes the tracked-file list, runs a second content pass, and checks for leftovers.

Binary file contents are not rewritten, because corrupting images, fonts, archives, databases, compiled assets, APKs, or SQLite files is how a simple script turns into a crime scene.

Binary filenames can still be renamed when the path itself contains a replacement token.

---

## Image and Binary Asset Note

The script does not rewrite binary file contents.

That is intentional.

Replacing bytes inside PNG, JPG, ICO, font, archive, SQLite, APK, compiled, or packaged files can corrupt them.

If an image visibly contains old branding, replace or regenerate the image manually. If a binary filename contains an old token, the tracked path can still be renamed safely.

This repo may still contain upstream-style icons or assets. I am doing my best to replace anything that would confuse the identity, but this is an unofficial fork and local-runtime experiment.

I am not trying to replace the work of the people who created OpenClaw.

This is simply another runtime.

---

## Included Scripts

This repo includes the rename scripts I used while building my local TheClaw runtime.

### `theclaw_rename_openclaw_clone_v0_5.py`

This was the first working version for my use case.

It successfully renamed the repo, package identity, command identity, tracked paths, and tracked text content.

However, one SQLite-related test file still had old lowercase fixture strings after the first pass, so I manually patched those leftovers afterward.

In other words:

```text
v0.5 worked for my local rename,
but it needed one small follow-up cleanup.
```

### `theclaw_rename_openclaw_clone_v0_6.py`

This is the cleaner public version.

It adds a second pass after tracked path renames:

```text
content pass 1
path rename pass
refresh tracked files
content pass 2
final leftover scan
optional fail-on-leftovers
```

The goal is to catch the kind of leftover fixture strings that survived in v0.5.

I already had my local TheClaw working by the time v0.6 was written, so I cannot claim it has been battle-tested as heavily as v0.5 in my exact setup. But v0.6 is the version I would start from if I were doing the rename again from a fresh clone.

---

## `tree.py`

`tree.py` is a small helper script for generating a readable directory tree.

That sounds boring until you are working with AI agents.

Then it becomes useful fast.

When you are asking an AI system to work inside a repo, especially a large repo, the model can lose track of what exists, where files live, and whether it is respecting the project structure. A clean directory tree gives the model a map before it starts guessing.

I use `tree.py` for things like:

- showing the current repo structure before a rename
- confirming path changes after a rename
- checking whether generated files landed in the correct folder
- giving AI a bounded view of the repo without dumping the entire project
- comparing implementation work against an SRS or execution plan
- catching cases where an agent created a new folder instead of editing the intended one
- proving that old names are gone from paths after a rename

In other words, `tree.py` is not the glamorous part of the operation.

It is the ringside camera.

It tells you whether the match happened in the right ring.

For AI-assisted development, that matters. A lot.

A rename script can change thousands of paths. A tree view helps confirm that the resulting repo still makes sense to a human before you move on to install, test, or publish.

---

## My Setup

My local setup is:

```text
Tier 1: OpenClaw
Tier 2: TheClaw
Tier 3: Hermes
```

The idea is to keep separate runtime surfaces instead of forcing every agent lane through the same identity, heartbeat, settings, and state assumptions.

The theory is that not reading extra heartbeat and settings files may reduce token usage in some workflows. That depends heavily on the model, billing structure, harness behavior, and how much context actually gets sent.

So do not take that to the bank.

It might help.

It might not.

And if it does not, well, as a last resort, you can always hit the problem with `theclaw`.

---

## Important Disclaimer

This is a brute-force rename strategy, not magic.

It may not stay current with upstream forever.

It may need project-specific replacement pairs.

It should be tested before install.

It should be run on a fresh clone.

Do not run this against your only copy of a repo.

It should not be pointed at binary file contents unless you enjoy corrupting assets.

It is not a replacement for understanding the upstream project.

It is not a clean long-term fork strategy by itself.

It is simply a practical way to create a renamed local runtime when the upstream runtime already works and you want a second isolated identity.

---

## Recommended Flow

Use a fresh clone.

Do not run this against your only copy.

```text
fresh clone
run dry-run
review summary
apply rename
verify no old tokens remain
verify package identity
verify CLI entrypoint
install as separate command
run with separate runtime home
```

---

## Clean Snapshot Publishing

If your goal is to publish a renamed runtime as a clean public snapshot, do not push the inherited upstream `.git` history by accident.

A simple low-friction approach is:

```text
fresh upstream clone
run the rename script
verify the renamed working tree
copy the renamed tree into a new publish folder without .git
initialize a fresh repo
commit one clean snapshot
push that clean snapshot
```

That avoids pushing old upstream commits, stale build artifacts hidden in history, bad author metadata, old remotes, and large object baggage from the original repository.

This is not the right approach if you need a long-term fork with upstream merge history.

It is the practical approach if you want a clean renamed runtime snapshot.

The claw has a mind of its own.

Respect it.
