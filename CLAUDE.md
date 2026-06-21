# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StartOS (0.4.x) package for the upstream [HAVEN](https://github.com/barrydeen/haven) Nostr relay — a sibling of [haven-kit](https://github.com/Letdown2491/haven-kit) (Docker/Podman + Umbrel). Unlike haven-kit there is **no web config UI**: StartOS has no host docker socket, so configuration is done natively through StartOS actions (`startos/actions/`) that write haven's config files, and StartOS itself handles interfaces, restarts, and backups.

## Commands

```bash
npm install
npm run check      # tsc --noEmit
npm run build      # ncc bundle to ./javascript (make does this for you)
make               # x86_64 + aarch64 .s9pk (needs start-cli + docker)
make x86           # one arch
make install       # sideload to server in ~/.startos/config.yaml
```

## Architecture

- **Dockerfile** builds haven from source at the ref pinned by `ARG HAVEN_VERSION` (mirrors haven-kit's `haven-relay/Dockerfile` — keep the two pins in sync when releasing both). `entrypoint.sh` copies `/haven-config/.env` → `/haven/.env` on every start, strips schemes from `RELAY_URL`, and blocks until all five npub settings are valid (haven panics otherwise; this prevents fresh-install crash loops).
- **One `main` volume**, subpaths mounted in `startos/main.ts`: `config/` → `/haven-config`, `db/` → `/haven/db`, `blossom/` → `/haven/blossom`.
- **Config flow**: `startos/fileModels/havenEnv.ts` models the `.env` (flat string map, values double-quoted on write for godotenv). `init/seedFiles.ts` seeds wizard-equivalent defaults with empty npubs, fill-missing-only. Actions merge keys into it. `main.ts` reads the model with `.const(effects)`, so **any action write restarts the relay automatically** — that is the StartOS replacement for haven-kit's "restart relay" button.
- **Setup action** (`actions/setup.ts`) sets `OWNER_NPUB` and copies it into all four per-relay npubs (like the haven-kit wizard), plus `RELAY_URL` chosen from the relay interface's public addresses (onion default) or a custom domain.
- **Access control** (`actions/npubLists.ts`, `fileModels/npubLists.ts`): the Whitelisted/Blacklisted npubs actions write `config/whitelisted_npubs.json` and `config/blacklisted_npubs.json` (JSON arrays of npubs; same shape as the relay lists), pointed to by `WHITELISTED_NPUBS_FILE`/`BLACKLISTED_NPUBS_FILE` in the `.env`. Haven always whitelists the owner implicitly (`config.go`), so an empty whitelist = owner-only. Unlike `.env` writes, these files are **not** watched by `main.ts`, and haven only reads them at startup, so the actions call `effects.restart()` themselves. Entries are checksum-validated with `isValidNpub` before writing (haven silently drops npubs it can't decode).
- **Interfaces** (`startos/interfaces.ts`): one `ws` origin on port 3355, four exported interfaces for the path-based relays (`/`, `/private`, `/chat`, `/inbox`). Blossom media is HTTP on the same port.
- **Tor**: on StartOS 0.4 Tor is a separate service (`tor`, a `url-v0` plugin), declared as an **optional** manifest dependency. Users add a .onion address to the relay interface via the StartOS UI; `dependencies.ts` declares a `running` dependency on `tor` only while `RELAY_URL` is an onion. Upstream haven has no outbound SOCKS support — Tor is inbound-only here (haven just switches to `ws://`/`http://` schemes for .onion RELAY_URLs).
- **i18n**: every user-facing string must be wrapped in `i18n()` and listed in `startos/i18n/dictionaries/default.ts`; translations.ts is empty (English fallback).

## Gotchas

- `RELAY_URL` must be a **bare hostname** (no scheme) — haven prepends `wss://`/`https://` itself; a scheme'd value breaks Blossom media URLs. `normalizeRelayHost` in `startos/utils.ts` and `entrypoint.sh` both enforce this.
- The SDK bundles zod v4: `z.record` takes two args.
- Versioning is `<upstream haven version>:<package revision>` (`startos/versions/`), **not** the haven-kit version. See UPDATING.md for the bump procedure (the old current.ts must be kept as a graph node).
- **History import**: the Import History action writes `config/import-requested` and then calls `effects.restart()`; `main.ts` re-runs into an `import` oneshot (`/entrypoint.sh /import.sh`) **in its own subcontainer** (`haven-import-sub`, separate from the relay's `haven-sub`) that the `primary` daemon `requires`. Key points, each the result of a bug found the hard way:
  - The marker is read with **`.once()`, not `.const()`**. The actions drive the re-run explicitly via `effects.restart()` (needed because the marker file is not seeded — unlike `.env` — so the SDK's file-*creation* watch can't be relied on to fire on all hosts). If the marker were `.const()`, `import.sh` deleting it at the end would fire the watch and trigger a **redundant restart** that races the import→primary handoff (the `/proc/1/ns/pid` "primary daemon crashed" crash, issue #1).
  - The import gets its **own subcontainer** so the import's PID 1 exiting doesn't churn the relay's container leader (the other half of the same crash).
  - Import is the **subcommand** `haven import` (not `haven --import`, which is an undefined flag that exits 2 without importing).
  - At the pinned ref `haven import` exits on its own (last log line `tagged import complete`); `import.sh` mirrors output to the logs, reports haven's exit code, keeps a SIGINT-on-completion watcher only as a safety net, and **always deletes the marker** so a failed import can't loop.
  - Cancel Import writes `cancelled` and calls `effects.restart()` to return to normal mode. Import is the **subcommand** `haven import` (not `haven --import` — that's an undefined flag and exits 2 without importing). At the pinned ref `haven import` exits on its own (last log line `tagged import complete`); `import.sh` mirrors its output to the logs and keeps a SIGINT-on-completion-phrase watcher only as a safety net for future versions that might not exit, and **always deletes the marker**, so a failed import can't loop. The import runs in its own subcontainer (separate from the relay's) to avoid a container-leader race; see `main.ts`. Cancel Import overwrites the marker, which restarts the service into normal mode.
