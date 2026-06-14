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
// This only checks the *shape* - a checksum-valid npub also passes
// isValidNpub() below.
export const npubRegex = '^npub1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$'
export const npubPattern = new RegExp(npubRegex)

// Haven decodes the owner npub with nip19 at startup and panics (exit code 2,
// a crash-loop) if the bech32 checksum is wrong - a well-formed but mistyped
// npub passes npubRegex yet still fails here. Verifying the checksum before we
// write the .env lets the Setup action reject it with a clear error instead.
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function bech32Polymod(values: number[]): number {
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let checksum = 1
  for (const value of values) {
    const top = checksum >>> 25
    checksum = ((checksum & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) checksum ^= generators[i]
    }
  }
  return checksum
}

// HRP expansion for the constant "npub" prefix (high bits, separator, low bits).
function npubHrpExpand(): number[] {
  const hrp = 'npub'
  const high: number[] = []
  const low: number[] = []
  for (let i = 0; i < hrp.length; i++) {
    high.push(hrp.charCodeAt(i) >> 5)
    low.push(hrp.charCodeAt(i) & 31)
  }
  return [...high, 0, ...low]
}

// True only for a syntactically valid npub whose bech32 checksum also verifies,
// matching what haven's nip19.Decode accepts.
export function isValidNpub(npub: string): boolean {
  if (!npubPattern.test(npub)) return false
  const data: number[] = []
  for (const char of npub.slice('npub1'.length)) {
    const index = BECH32_CHARSET.indexOf(char)
    if (index === -1) return false
    data.push(index)
  }
  return bech32Polymod([...npubHrpExpand(), ...data]) === 1
}

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
