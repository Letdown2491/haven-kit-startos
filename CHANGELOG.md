# Changelog

All notable changes to this StartOS package are documented here.

## [1.2.2:5] - 2026-06-20

### Added

- **Whitelisted npubs** and **Blacklisted npubs** actions (group _Configure_).
  Whitelisting other people's npubs lets them use the relay alongside you —
  read and write the private relay, post to the outbox relay, and be tagged on
  the inbox relay — without sharing your key (the owner is always whitelisted,
  so an empty list keeps the prior owner-only behaviour). The blacklist hard-
  rejects abusive keys from posting to any relay, overriding the whitelist and
  web of trust. Both lists are validated (checksum-checked) before writing and
  the relay restarts to apply them, since haven only reads the
  `whitelisted_npubs.json` / `blacklisted_npubs.json` files at startup.

## [1.2.2:4] - 2026-06-15

### Fixed

- Fix the `primary daemon crashed` / `open /proc/1/ns/pid: No such file` crash
  that hit right after a history import finished (issue #1). Two compounding
  races at the import→relay handoff:
  - `import.sh` deletes the marker when done; the marker was read with `.const()`,
    so that deletion fired the watch and kicked off a **redundant restart** that
    collided with the import→primary handoff already in progress. The marker is
    now read with `.once()` — the actions already trigger the re-run explicitly
    via `effects.restart()`, so the watch was both redundant and harmful.
  - The import shared the relay's subcontainer, so the import's container leader
    (PID 1) exited and the relay then re-launched a new leader in that same,
    just-vacated container. The import now runs in its **own subcontainer**,
    keeping that leader churn away from the relay's container.

## [1.2.2:3] - 2026-06-15

### Changed

- Version bump so a sideload actually replaces a prior `1.2.2:2` install
  (StartOS keys updates off the version string and may skip re-installing the
  same version). Added a `HAVEN StartOS package build: <version>` line at
  startup so the running build can be confirmed in the service logs.
- The history import shares the relay's subcontainer again (the brief
  experiment with a dedicated import subcontainer is reverted); combined with
  the `1.2.2:2` import fixes below, this is the minimal working import path.

## [1.2.2:2] - 2026-06-15

### Fixed

- Actually start the import when requested. The Import History action wrote a
  marker file and relied on `main.ts`'s `.const()` read to auto-restart the
  service - but that depends on a filesystem watch that doesn't fire on all
  StartOS hosts when the marker is *created* for the first time (the always-
  seeded `.env` doesn't hit this path, which is why config changes did restart).
  The action now calls `effects.restart()` explicitly after writing the marker,
  so the import runs regardless of watch behavior. Cancel Import does the same.

- Invoke the history import correctly. `import.sh` ran `haven import` as
  `haven --import`, but haven has no `--import` flag, so haven exited
  immediately with code 2 (`flag provided but not defined`) and **no notes were
  ever imported** — the relay then started as if the import had run. The import
  is the `haven import` subcommand; calling it correctly is the difference
  between the import working and silently doing nothing.

### Changed

- The import logs gained loud `HAVEN IMPORT STARTED`/`FINISHED`/`FAILED`
  banners and now report haven's exit code, so a failed import is no longer
  silently mistaken for a successful one. While the import runs the service
  stays offline and returns to Running on its own when it finishes - that
  transition is the signal that the import is done.

## [1.2.2:1] - 2026-06-14

### Fixed

- Reject invalid npubs during Setup and at startup. A mistyped npub (the right
  length and character set but an invalid bech32 checksum) previously passed the
  format check, reached haven, and made it panic on an undecodable npub —
  crash-looping the relay (issue #1). The npub's checksum is now verified both
  in the Setup action (`startos/actions/setup.ts`) and in `entrypoint.sh`, so a
  bad npub is rejected with a clear message instead.

### Changed

- Timezone in Advanced Settings is now a dropdown of IANA zone names instead of
  a free-text field, so an invalid entry can no longer be saved.

## [1.2.2:0] - 2026-06-11

### Added

- Initial StartOS package for HAVEN 1.2.2, built from upstream source at the
  pinned ref. Configuration via native StartOS actions (no web UI), four
  path-based relays plus a Blossom media server on port 3355, one-shot history
  import via the Import History action, and Tor declared as an optional
  dependency.
