import { havenEnv } from '../fileModels/havenEnv'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import {
  normalizeRelayHost,
  npubRegex,
  relayInterfaceId,
  requiredNpubKeys,
} from '../utils'

const { InputSpec, Value, Variants } = sdk

// All public addresses of the relay interface (onion, .local, IPs, and any
// custom domains added in the StartOS UI), as bare host[:port] strings.
const externalHosts = (urls: string[]) => [
  ...new Set(urls.map(normalizeRelayHost).filter((h) => h.length > 0)),
]

export const inputSpec = InputSpec.of({
  ownerNpub: Value.text({
    name: i18n('Owner npub'),
    description: i18n(
      'Your Nostr public key (npub format). Only the owner can write to the private and outbox relays.',
    ),
    required: true,
    default: null,
    placeholder: 'npub1...',
    masked: false,
    patterns: [
      {
        regex: npubRegex,
        description: i18n(
          'Must be a valid npub: "npub1" followed by 58 bech32 characters',
        ),
      },
    ],
  }),
  relayUrl: Value.dynamicUnion(async ({ effects }) => {
    const urls = await sdk.serviceInterface
      .getOwn(
        effects,
        relayInterfaceId,
        (iface) => iface?.addressInfo?.public.format() || [],
      )
      .const()

    const hosts = externalHosts(urls)

    return {
      name: i18n('Relay Address'),
      description: i18n(
        'The public address clients use to reach your relay. Haven adds wss:// and https:// itself, so this is a bare hostname. Pick one of your StartOS addresses (the Tor address works without any extra setup) or enter a custom domain.',
      ),
      default: 'select',
      disabled: false,
      variants: Variants.of({
        select: {
          name: i18n('Choose a StartOS address'),
          spec: InputSpec.of({
            host: Value.select({
              name: i18n('Address'),
              values: hosts.reduce(
                (obj, host) => ({ ...obj, [host]: host }),
                {} as Record<string, string>,
              ),
              default:
                hosts.find((h) => h.endsWith('.onion')) || hosts[0] || '',
            }),
          }),
        },
        custom: {
          name: i18n('Custom domain'),
          spec: InputSpec.of({
            host: Value.text({
              name: i18n('Hostname'),
              description: i18n(
                'Bare hostname (and optional port) - no ws:// or https:// prefix',
              ),
              required: true,
              default: null,
              placeholder: 'relay.example.com',
              masked: false,
            }),
          }),
        },
      }),
    }
  }),
})

export const setup = sdk.Action.withInput(
  // id
  'setup',

  // metadata
  async ({ effects }) => ({
    name: i18n('Setup'),
    description: i18n(
      'Set your owner npub and public relay address. The relay starts automatically once configured.',
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

    const urls = await sdk.serviceInterface
      .getOwn(
        effects,
        relayInterfaceId,
        (iface) => iface?.addressInfo?.public.format() || [],
      )
      .once()
    const hosts = externalHosts(urls || [])

    const relayUrl = env.RELAY_URL || ''

    return {
      ownerNpub: env.OWNER_NPUB || undefined,
      relayUrl: relayUrl
        ? hosts.includes(relayUrl)
          ? { selection: 'select' as const, value: { host: relayUrl } }
          : { selection: 'custom' as const, value: { host: relayUrl } }
        : undefined,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const host = normalizeRelayHost(input.relayUrl.value.host || '')

    // Haven requires all four per-relay npubs as well; like the haven-kit
    // wizard, they are all the owner's npub.
    const npubs = Object.fromEntries(
      requiredNpubKeys.map((key) => [key, input.ownerNpub]),
    )

    await havenEnv.merge(effects, { ...npubs, RELAY_URL: host })
  },
)
