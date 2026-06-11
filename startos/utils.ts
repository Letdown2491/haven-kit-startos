// Shared constants and helpers for the HAVEN package.

// Port haven listens on inside the container (websocket relay + Blossom HTTP).
export const relayPort = 3355

// Id of the primary (outbox) relay interface, used to look up public addresses.
export const relayInterfaceId = 'websocket'

// Haven expects RELAY_URL to be a bare hostname (it prepends wss:// and
// https:// itself); a scheme'd value yields malformed Blossom media URLs
// (https://wss://...). Strip any scheme and path, keep an optional port.
export function normalizeRelayHost(url: string): string {
  return url
    .trim()
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
    .replace(/\/.*$/, '')
}

// A real npub is "npub1" plus 58 bech32 characters; anything else (empty, a
// template placeholder, ...) means "not set up yet". Mirrors entrypoint.sh.
export const npubRegex = '^npub1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$'
export const npubPattern = new RegExp(npubRegex)

// Haven panics unless the owner and all four per-relay npubs are set; the
// package always sets the per-relay npubs to the owner npub (like the
// haven-kit wizard does).
export const requiredNpubKeys = [
  'OWNER_NPUB',
  'PRIVATE_RELAY_NPUB',
  'CHAT_RELAY_NPUB',
  'OUTBOX_RELAY_NPUB',
  'INBOX_RELAY_NPUB',
] as const
