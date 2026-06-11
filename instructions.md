# HAVEN

HAVEN (High Availability Vault for Events on Nostr) is four personal Nostr relays in one, plus a built-in Blossom media server:

- **Private relay** (`/private`) — drafts and personal notes, readable and writable only by you
- **Chat relay** (`/chat`) — your DMs, protected by web-of-trust filtering
- **Outbox relay** (`/`) — your public notes, re-broadcast (blasted) to other public relays; also serves Blossom media over HTTP
- **Inbox relay** (`/inbox`) — where other relays and users send notes that tag you

## Setup

1. After installing, the relay idles with the message "Awaiting configuration".
2. Go to **Actions → Setup** and enter:
   - **Owner npub** — your Nostr public key (get it from your Nostr client)
   - **Relay Address** — the public address clients use to reach the relay. The Tor (.onion) address works out of the box; a custom domain works too if you have one routed to the relay interface.
3. Save. The relay starts automatically within a few seconds.

## Connecting clients

Take the four interface URLs from the **Interfaces** section. In your Nostr client, add the outbox relay as a general read/write relay, the inbox relay as your inbox/DM target, and the private relay in clients that support private relays. The relay address you chose during Setup is also your Blossom media server (over HTTPS/HTTP on the same host).

## Configuration

All settings live under **Actions**:

- **Setup** — owner npub and public relay address
- **Relay Info** — name, description, and icon for each of the four relays
- **Advanced Settings** — database engine, web-of-trust depth, import start date, log level, timezone
- **Blastr Relays** — public relays your outbox notes are broadcast to
- **Import Relays** — seed relays used when haven imports your existing notes

Configuration changes restart the relay automatically.

## Importing your existing notes

To pull your historical notes into HAVEN:

1. Add a few relays where your notes live via **Actions → Import Relays** (e.g. `wss://relay.damus.io`).
2. Optionally set the **Import Start Date** in Advanced Settings — older notes are skipped.
3. Run **Actions → Import History**. The relay restarts and stays offline while the import runs; follow progress in the service **Logs**. The relay comes back automatically when the import finishes (a **Cancel Import** action appears while one is pending).

Haven also imports continuously in the background from the same relays while running.

## Notes

- Backups via StartOS cover the database, media, and configuration. Haven's own S3 backup feature is disabled by default.
