import { havenEnv } from '../fileModels/havenEnv'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  dbEngine: Value.select({
    name: i18n('Database Engine'),
    description: i18n(
      'Badger is the default and works well on most hardware. LMDB can be faster but requires tuning the map size.',
    ),
    values: {
      badger: 'Badger',
      lmdb: 'LMDB',
    },
    default: 'badger',
  }),
  lmdbMapsize: Value.number({
    name: i18n('LMDB Map Size (bytes)'),
    description: i18n(
      'Maximum database size. Only used when LMDB is selected.',
    ),
    required: false,
    default: null,
    integer: true,
    min: 1,
    placeholder: '273000000000',
  }),
  chatWotDepth: Value.number({
    name: i18n('Chat Web of Trust Depth'),
    description: i18n(
      'How many hops from your follows count as trusted on the chat relay',
    ),
    required: false,
    default: null,
    integer: true,
    min: 1,
    placeholder: '3',
  }),
  chatWotRefreshHours: Value.number({
    name: i18n('Chat Web of Trust Refresh (hours)'),
    description: null,
    required: false,
    default: null,
    integer: true,
    min: 1,
    placeholder: '24',
  }),
  chatMinimumFollowers: Value.number({
    name: i18n('Chat Minimum Followers'),
    description: i18n(
      'Minimum followers within your web of trust required to use the chat relay',
    ),
    required: false,
    default: null,
    integer: true,
    min: 0,
    placeholder: '3',
  }),
  inboxPullIntervalSeconds: Value.number({
    name: i18n('Inbox Pull Interval (seconds)'),
    description: i18n('How often the inbox relay pulls notes that tag you'),
    required: false,
    default: null,
    integer: true,
    min: 10,
    placeholder: '600',
  }),
  importStartDate: Value.text({
    name: i18n('Import Start Date'),
    description: i18n(
      'Notes older than this date are skipped when importing your history',
    ),
    required: false,
    default: null,
    placeholder: '2023-01-01',
    masked: false,
    patterns: [
      {
        regex: '^\\d{4}-\\d{2}-\\d{2}$',
        description: i18n('Must be a date in YYYY-MM-DD format'),
      },
    ],
  }),
  logLevel: Value.select({
    name: i18n('Log Level'),
    values: {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR',
    },
    default: 'INFO',
  }),
  tz: Value.text({
    name: i18n('Timezone'),
    description: i18n('IANA timezone name used for logs and backups'),
    required: false,
    default: null,
    placeholder: 'UTC',
    masked: false,
  }),
})

const numOrUndefined = (value: string | undefined) =>
  value && !isNaN(Number(value)) ? Number(value) : undefined

export const advanced = sdk.Action.withInput(
  // id
  'advanced',

  // metadata
  async ({ effects }) => ({
    name: i18n('Advanced Settings'),
    description: i18n(
      'Database engine, web of trust, import, and logging settings',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configure'),
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const env = await havenEnv.read().once()
    if (!env) return

    return {
      dbEngine:
        env.DB_ENGINE === 'lmdb' ? ('lmdb' as const) : ('badger' as const),
      lmdbMapsize: numOrUndefined(env.LMDB_MAPSIZE),
      chatWotDepth: numOrUndefined(env.CHAT_RELAY_WOT_DEPTH),
      chatWotRefreshHours: numOrUndefined(
        env.CHAT_RELAY_WOT_REFRESH_INTERVAL_HOURS,
      ),
      chatMinimumFollowers: numOrUndefined(env.CHAT_RELAY_MINIMUM_FOLLOWERS),
      inboxPullIntervalSeconds: numOrUndefined(env.INBOX_PULL_INTERVAL_SECONDS),
      importStartDate: env.IMPORT_START_DATE || undefined,
      logLevel: (['DEBUG', 'INFO', 'WARN', 'ERROR'] as const).includes(
        env.HAVEN_LOG_LEVEL as any,
      )
        ? (env.HAVEN_LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR')
        : ('INFO' as const),
      tz: env.TZ || undefined,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const updates: Record<string, string> = {
      DB_ENGINE: input.dbEngine,
      HAVEN_LOG_LEVEL: input.logLevel,
    }
    if (input.lmdbMapsize !== null)
      updates.LMDB_MAPSIZE = String(input.lmdbMapsize)
    if (input.chatWotDepth !== null)
      updates.CHAT_RELAY_WOT_DEPTH = String(input.chatWotDepth)
    if (input.chatWotRefreshHours !== null)
      updates.CHAT_RELAY_WOT_REFRESH_INTERVAL_HOURS = String(
        input.chatWotRefreshHours,
      )
    if (input.chatMinimumFollowers !== null)
      updates.CHAT_RELAY_MINIMUM_FOLLOWERS = String(input.chatMinimumFollowers)
    if (input.inboxPullIntervalSeconds !== null)
      updates.INBOX_PULL_INTERVAL_SECONDS = String(
        input.inboxPullIntervalSeconds,
      )
    if (input.importStartDate !== null)
      updates.IMPORT_START_DATE = input.importStartDate
    if (input.tz !== null && input.tz !== '') updates.TZ = input.tz

    await havenEnv.merge(effects, updates)
  },
)
