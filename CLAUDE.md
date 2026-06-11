# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

StartOS (0.4.x) package for the upstream [HAVEN](https://github.com/barrydeen/haven) Nostr relay — a sibling of [haven-kit](https://github.com/Letdown2491/haven-kit) (Docker/Podman + Umbrel). Unlike haven-kit there is **no web config UI**: StartOS has no host docker socket, so configuration is done natively through StartOS actions (`startos/actions/`) that write haven's config files, and StartOS itself handles Tor, interfaces, restarts, and backups.

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
- **Interfaces** (`startos/interfaces.ts`): one `ws` origin on port 3355, four exported interfaces for the path-based relays (`/`, `/private`, `/chat`, `/inbox`). Blossom media is HTTP on the same port.
- **i18n**: every user-facing string must be wrapped in `i18n()` and listed in `startos/i18n/dictionaries/default.ts`; translations.ts is empty (English fallback).

## Gotchas

- `RELAY_URL` must be a **bare hostname** (no scheme) — haven prepends `wss://`/`https://` itself; a scheme'd value breaks Blossom media URLs. `normalizeRelayHost` in `startos/utils.ts` and `entrypoint.sh` both enforce this.
- The SDK bundles zod v4: `z.record` takes two args.
- Versioning is `<upstream haven version>:<package revision>` (`startos/versions/`), **not** the haven-kit version. See UPDATING.md for the bump procedure (the old current.ts must be kept as a graph node).
- **History import**: the Import History action writes `config/import-requested`; `main.ts` (`.const()` read) restarts into an `import` oneshot (`/entrypoint.sh /import.sh`) that the `primary` daemon `requires`. `import.sh` watches stdout for haven's completion phrases ("tagged import complete" / "please restart the relay" — the binary never exits on its own), SIGINTs it, and **always deletes the marker**, so a failed import can't loop. Cancel Import overwrites the marker, which restarts the service into normal mode.
