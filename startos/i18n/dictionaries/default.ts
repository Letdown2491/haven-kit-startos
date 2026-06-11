export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting HAVEN': 0,
  Relay: 1,
  'The relay is ready': 2,
  'The relay is not ready': 3,
  'Awaiting configuration - run Actions > Setup to enter your npub': 4,

  // interfaces.ts
  'Outbox Relay': 5,
  'Your public outbox relay. Also serves Blossom media over HTTP on the same host.': 6,
  'Private Relay': 7,
  'Your private relay, for your eyes only': 8,
  'Chat Relay': 9,
  'Your DM relay, protected by web of trust': 10,
  'Inbox Relay': 11,
  'Where others send notes that tag you': 12,

  // actions/setup.ts
  'Owner npub': 13,
  'Your Nostr public key (npub format). Only the owner can write to the private and outbox relays.': 14,
  'Must be a valid npub: "npub1" followed by 58 bech32 characters': 15,
  'Relay Address': 16,
  'The public address clients use to reach your relay. Haven adds the scheme itself, so this is a bare hostname. Pick one of your StartOS addresses or enter a custom domain. For a Tor (.onion) address, install the Tor service, add a Tor address to the relay interface, then re-open this action.': 17,
  'Choose a StartOS address': 18,
  Address: 19,
  'Custom domain': 20,
  Hostname: 21,
  'Bare hostname (and optional port) - no ws:// or https:// prefix': 22,
  Setup: 23,
  'Set your owner npub and public relay address. The relay starts automatically once configured.': 24,
  Configure: 25,

  // actions/relayInfo.ts
  Name: 26,
  Description: 27,
  'Icon URL': 28,
  'Optional URL of an image to use as the relay icon': 29,
  'Relay Info': 30,
  'Customize the public name, description, and icon of each of your four relays (NIP-11)': 31,

  // actions/advanced.ts
  'Database Engine': 32,
  'Badger is the default and works well on most hardware. LMDB can be faster but requires tuning the map size.': 33,
  'LMDB Map Size (bytes)': 34,
  'Maximum database size. Only used when LMDB is selected.': 35,
  'Chat Web of Trust Depth': 36,
  'How many hops from your follows count as trusted on the chat relay': 37,
  'Chat Web of Trust Refresh (hours)': 38,
  'Chat Minimum Followers': 39,
  'Minimum followers within your web of trust required to use the chat relay': 40,
  'Inbox Pull Interval (seconds)': 41,
  'How often the inbox relay pulls notes that tag you': 42,
  'Import Start Date': 43,
  'Notes older than this date are skipped when importing your history': 44,
  'Must be a date in YYYY-MM-DD format': 45,
  'Log Level': 46,
  Timezone: 47,
  'IANA timezone name used for logs and backups': 48,
  'Advanced Settings': 49,
  'Database engine, web of trust, import, and logging settings': 50,

  // actions/relayLists.ts
  'Must be a websocket URL starting with wss:// or ws://': 51,
  'Blastr Relays': 52,
  'Public relays your outbox notes are re-broadcast to, so they reach the wider network': 53,
  'Import Relays': 54,
  'Relays haven pulls your existing notes from when importing your history': 55,
  'Manage the list of public relays your outbox notes are broadcast to': 56,
  'Manage the list of seed relays used when importing your existing notes': 57,

  // actions/importHistory.ts
  'Import History': 58,
  'Pull your existing notes from the configured import relays into your outbox and inbox. Progress is shown in the service logs.': 59,
  'The relay restarts and stays offline while the import runs. This can take several minutes.': 60,
  'Not configured': 61,
  'Run the Setup action first - the import needs your npub.': 62,
  'No import relays': 63,
  'Add at least one relay with the Import Relays action first, so haven knows where to pull your notes from.': 64,
  'Import scheduled': 65,
  'The relay is restarting to run the import. Follow progress in the service logs; the relay comes back automatically when the import finishes.': 66,
  'Cancel Import': 67,
  'Cancel the pending or running history import and start the relay normally': 68,
  'Import cancelled': 69,
  'The relay is restarting normally.': 70,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
