import { havenEnv } from '../fileModels/havenEnv'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const relaySpec = (relayName: string) =>
  InputSpec.of({
    name: Value.text({
      name: i18n('Name'),
      description: null,
      required: false,
      default: null,
      placeholder: relayName,
      masked: false,
    }),
    description: Value.text({
      name: i18n('Description'),
      description: null,
      required: false,
      default: null,
      masked: false,
    }),
    icon: Value.text({
      name: i18n('Icon URL'),
      description: i18n('Optional URL of an image to use as the relay icon'),
      required: false,
      default: null,
      placeholder: 'https://example.com/icon.png',
      masked: false,
    }),
  })

export const inputSpec = InputSpec.of({
  private: Value.object(
    { name: i18n('Private Relay') },
    relaySpec('Private Relay'),
  ),
  chat: Value.object({ name: i18n('Chat Relay') }, relaySpec('Chat Relay')),
  outbox: Value.object(
    { name: i18n('Outbox Relay') },
    relaySpec('Outbox Relay'),
  ),
  inbox: Value.object({ name: i18n('Inbox Relay') }, relaySpec('Inbox Relay')),
})

type RelayKey = 'PRIVATE' | 'CHAT' | 'OUTBOX' | 'INBOX'

const envGroup = (env: Record<string, string>, prefix: RelayKey) => ({
  name: env[`${prefix}_RELAY_NAME`] || undefined,
  description: env[`${prefix}_RELAY_DESCRIPTION`] || undefined,
  icon: env[`${prefix}_RELAY_ICON`] || undefined,
})

const groupEnv = (
  prefix: RelayKey,
  group: {
    name: string | null
    description: string | null
    icon: string | null
  },
): Record<string, string> => {
  const out: Record<string, string> = {}
  if (group.name !== null) out[`${prefix}_RELAY_NAME`] = group.name
  if (group.description !== null)
    out[`${prefix}_RELAY_DESCRIPTION`] = group.description
  // empty string clears a previously set icon
  if (group.icon !== null) out[`${prefix}_RELAY_ICON`] = group.icon
  return out
}

export const relayInfo = sdk.Action.withInput(
  // id
  'relay-info',

  // metadata
  async ({ effects }) => ({
    name: i18n('Relay Info'),
    description: i18n(
      'Customize the public name, description, and icon of each of your four relays (NIP-11)',
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
      private: envGroup(env, 'PRIVATE'),
      chat: envGroup(env, 'CHAT'),
      outbox: envGroup(env, 'OUTBOX'),
      inbox: envGroup(env, 'INBOX'),
    }
  },

  // the execution function
  async ({ effects, input }) =>
    havenEnv.merge(effects, {
      ...groupEnv('PRIVATE', input.private),
      ...groupEnv('CHAT', input.chat),
      ...groupEnv('OUTBOX', input.outbox),
      ...groupEnv('INBOX', input.inbox),
    }),
)
