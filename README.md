# HAVEN for StartOS

[HAVEN](https://github.com/barrydeen/haven) (High Availability Vault for Events on Nostr) packaged for [StartOS](https://github.com/Start9Labs/start-os). HAVEN is a sovereign personal Nostr relay — four relays in one (private, chat, inbox, outbox) plus a built-in Blossom media server.

This package builds the upstream haven binary from source at the ref pinned in `Dockerfile` (`HAVEN_VERSION`) and configures it natively through StartOS actions — no separate web UI. It is a sibling of [haven-kit](https://github.com/Letdown2491/haven-kit), which packages HAVEN for Docker/Podman and Umbrel.

## Building

Requires the [StartOS SDK environment](https://docs.start9.com/packaging/0.4.0.x/environment-setup.html) (`start-cli`, Docker, Node.js, Make).

```bash
npm install
make            # builds haven_x86_64.s9pk and haven_aarch64.s9pk
make x86        # just one arch
make install    # sideload to the server configured in ~/.startos/config.yaml
```

`npm run check` typechecks the `startos/` sources without packing.

## How it works

- `Dockerfile` builds haven from source (Go) into a minimal Alpine image. Its `entrypoint.sh` copies `/haven-config/.env` to `/haven/.env` on every start and refuses to launch haven until the npub settings are valid, so a fresh install never crash-loops.
- One `main` volume holds `config/` (`.env`, `relays_blastr.json`, `relays_import.json`), `db/`, and `blossom/`.
- `startos/` is the package logic (TypeScript, `@start9labs/start-sdk`): actions write the config files, and `main.ts` reads the `.env` file model with `.const()` so any config change restarts the relay automatically.
- Haven's `RELAY_URL` must be a **bare hostname** (no `ws://`/`wss://` scheme) — haven prepends schemes itself, and a scheme'd value yields malformed Blossom media URLs. The Setup action normalizes input and `entrypoint.sh` strips schemes defensively on every start.

- The **Import History** action replaces the kit's interactive bulk-import flow: it writes a marker file that `main.ts` reads with `.const()`, restarting the service into a oneshot that runs `haven --import` (`import.sh` watches for the importer's completion phrases and SIGINTs it, since the binary never exits on its own) before the relay daemon starts. Progress streams to the regular service logs.

## Not yet implemented

- **Translations** — the i18n plumbing is in place (`startos/i18n/`), but only English strings are provided; other languages fall back to English.

## Updating the upstream version

See [UPDATING.md](UPDATING.md).
