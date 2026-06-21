import { havenEnv } from '../fileModels/havenEnv'
import { blacklistedNpubs, whitelistedNpubs } from '../fileModels/npubLists'
import { relaysBlastr, relaysImport } from '../fileModels/relayLists'
import { sdk } from '../sdk'

/**
 * Default .env, mirroring the haven-kit wizard's defaults. The npub keys are
 * deliberately empty: the relay entrypoint refuses to start haven until the
 * Setup action fills them in, so a fresh install never crash-loops.
 *
 * Paths are container paths: the "main" volume's config/ subdir is mounted at
 * /haven-config, db/ at /haven/db, blossom/ at /haven/blossom (see main.ts).
 */
export const defaultEnv: Record<string, string> = {
  // Owner (REQUIRED, set by the Setup action)
  OWNER_NPUB: '',

  // Relay host (bare hostname, no scheme - haven adds wss://https:// itself)
  RELAY_URL: '',
  RELAY_PORT: '3355',
  RELAY_BIND_ADDRESS: '0.0.0.0',

  // Database
  DB_ENGINE: 'badger',
  LMDB_MAPSIZE: '273000000000',

  // Media storage
  BLOSSOM_PATH: '/haven/blossom',

  // Private relay
  PRIVATE_RELAY_NAME: 'Private Relay',
  PRIVATE_RELAY_NPUB: '',
  PRIVATE_RELAY_DESCRIPTION: 'A private relay for your eyes only',
  PRIVATE_RELAY_ICON: '',
  PRIVATE_RELAY_EVENT_IP_LIMITER_TOKENS_PER_INTERVAL: '50',
  PRIVATE_RELAY_EVENT_IP_LIMITER_INTERVAL: '1',
  PRIVATE_RELAY_EVENT_IP_LIMITER_MAX_TOKENS: '100',
  PRIVATE_RELAY_ALLOW_EMPTY_FILTERS: 'true',
  PRIVATE_RELAY_ALLOW_COMPLEX_FILTERS: 'true',
  PRIVATE_RELAY_CONNECTION_RATE_LIMITER_TOKENS_PER_INTERVAL: '3',
  PRIVATE_RELAY_CONNECTION_RATE_LIMITER_INTERVAL: '5',
  PRIVATE_RELAY_CONNECTION_RATE_LIMITER_MAX_TOKENS: '9',

  // Chat relay
  CHAT_RELAY_NAME: 'Chat Relay',
  CHAT_RELAY_NPUB: '',
  CHAT_RELAY_DESCRIPTION: 'A relay for private chats',
  CHAT_RELAY_ICON: '',
  CHAT_RELAY_WOT_DEPTH: '3',
  CHAT_RELAY_WOT_REFRESH_INTERVAL_HOURS: '24',
  CHAT_RELAY_MINIMUM_FOLLOWERS: '3',
  CHAT_RELAY_EVENT_IP_LIMITER_TOKENS_PER_INTERVAL: '50',
  CHAT_RELAY_EVENT_IP_LIMITER_INTERVAL: '1',
  CHAT_RELAY_EVENT_IP_LIMITER_MAX_TOKENS: '100',
  CHAT_RELAY_ALLOW_EMPTY_FILTERS: 'false',
  CHAT_RELAY_ALLOW_COMPLEX_FILTERS: 'false',
  CHAT_RELAY_CONNECTION_RATE_LIMITER_TOKENS_PER_INTERVAL: '3',
  CHAT_RELAY_CONNECTION_RATE_LIMITER_INTERVAL: '3',
  CHAT_RELAY_CONNECTION_RATE_LIMITER_MAX_TOKENS: '9',

  // Outbox relay
  OUTBOX_RELAY_NAME: 'Outbox Relay',
  OUTBOX_RELAY_NPUB: '',
  OUTBOX_RELAY_DESCRIPTION:
    'A relay and Blossom server for public messages and media',
  OUTBOX_RELAY_ICON: '',
  OUTBOX_RELAY_EVENT_IP_LIMITER_TOKENS_PER_INTERVAL: '10',
  OUTBOX_RELAY_EVENT_IP_LIMITER_INTERVAL: '60',
  OUTBOX_RELAY_EVENT_IP_LIMITER_MAX_TOKENS: '100',
  OUTBOX_RELAY_ALLOW_EMPTY_FILTERS: 'false',
  OUTBOX_RELAY_ALLOW_COMPLEX_FILTERS: 'false',
  OUTBOX_RELAY_CONNECTION_RATE_LIMITER_TOKENS_PER_INTERVAL: '3',
  OUTBOX_RELAY_CONNECTION_RATE_LIMITER_INTERVAL: '1',
  OUTBOX_RELAY_CONNECTION_RATE_LIMITER_MAX_TOKENS: '9',

  // Inbox relay
  INBOX_RELAY_NAME: 'Inbox Relay',
  INBOX_RELAY_NPUB: '',
  INBOX_RELAY_DESCRIPTION: 'Send your interactions with my notes here',
  INBOX_RELAY_ICON: '',
  INBOX_PULL_INTERVAL_SECONDS: '600',
  INBOX_RELAY_EVENT_IP_LIMITER_TOKENS_PER_INTERVAL: '10',
  INBOX_RELAY_EVENT_IP_LIMITER_INTERVAL: '1',
  INBOX_RELAY_EVENT_IP_LIMITER_MAX_TOKENS: '20',
  INBOX_RELAY_ALLOW_EMPTY_FILTERS: 'false',
  INBOX_RELAY_ALLOW_COMPLEX_FILTERS: 'false',
  INBOX_RELAY_CONNECTION_RATE_LIMITER_TOKENS_PER_INTERVAL: '3',
  INBOX_RELAY_CONNECTION_RATE_LIMITER_INTERVAL: '1',
  INBOX_RELAY_CONNECTION_RATE_LIMITER_MAX_TOKENS: '9',

  // Import
  IMPORT_START_DATE: '2023-01-01',
  IMPORT_QUERY_INTERVAL_SECONDS: '600',
  IMPORT_OWNER_NOTES_FETCH_TIMEOUT_SECONDS: '60',
  IMPORT_TAGGED_NOTES_FETCH_TIMEOUT_SECONDS: '120',
  IMPORT_SEED_RELAYS_FILE: '/haven-config/relays_import.json',

  // Backups (StartOS backs up the whole volume; haven's own backups stay off)
  BACKUP_PROVIDER: 'none',
  BACKUP_INTERVAL_HOURS: '24',

  // Blastr
  BLASTR_RELAYS_FILE: '/haven-config/relays_blastr.json',

  // Access control (JSON arrays of npubs; the owner is always whitelisted).
  // Empty files keep the default owner-only behaviour.
  WHITELISTED_NPUBS_FILE: '/haven-config/whitelisted_npubs.json',
  BLACKLISTED_NPUBS_FILE: '/haven-config/blacklisted_npubs.json',

  // Web of trust
  WOT_FETCH_TIMEOUT_SECONDS: '60',

  // Logging
  HAVEN_LOG_LEVEL: 'INFO',
  TZ: 'UTC',
}

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // Fill in any missing keys without clobbering user-set values.
  const existing = await havenEnv.read().once()
  await havenEnv.write(effects, { ...defaultEnv, ...(existing || {}) })

  if ((await relaysBlastr.read().once()) === null) {
    await relaysBlastr.write(effects, [])
  }
  if ((await relaysImport.read().once()) === null) {
    await relaysImport.write(effects, [])
  }
  if ((await whitelistedNpubs.read().once()) === null) {
    await whitelistedNpubs.write(effects, [])
  }
  if ((await blacklistedNpubs.read().once()) === null) {
    await blacklistedNpubs.write(effects, [])
  }
})
