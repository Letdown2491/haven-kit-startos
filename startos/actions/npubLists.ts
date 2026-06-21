import { blacklistedNpubs, whitelistedNpubs } from '../fileModels/npubLists'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { isValidNpub, npubRegex } from '../utils'

const { InputSpec, Value, List } = sdk

const npubPattern = {
  regex: npubRegex,
  description: i18n('Must be a valid npub: "npub1" followed by 58 bech32 characters'),
}

const whitelistSpec = InputSpec.of({
  npubs: Value.list(
    List.text(
      {
        name: i18n('Whitelisted npubs'),
        description: i18n(
          'Nostr public keys allowed to use the relay alongside you: they can read and write your private relay, post to your outbox relay, and be tagged on your inbox relay. Your owner npub is always allowed and does not need to be listed.',
        ),
      },
      {
        placeholder: 'npub1...',
        patterns: [npubPattern],
      },
    ),
  ),
})

const blacklistSpec = InputSpec.of({
  npubs: Value.list(
    List.text(
      {
        name: i18n('Blacklisted npubs'),
        description: i18n(
          'Nostr public keys banned from posting to any of your relays. A blacklist entry overrides the whitelist and web of trust.',
        ),
      },
      {
        placeholder: 'npub1...',
        patterns: [npubPattern],
      },
    ),
  ),
})

// The form regex only checks an npub's shape; haven silently ignores any npub
// it cannot bech32-decode, so a mistyped key would just be dropped without
// feedback. Reject checksum-invalid entries up front, like the Setup action.
function rejectInvalid(npubs: string[]): void {
  const bad = npubs.find((npub) => !isValidNpub(npub))
  if (bad) {
    throw new Error(
      i18n(
        'One of the npubs is not valid. Double-check for typos or missing characters - each must be an "npub1..." key copied exactly from a Nostr client.',
      ),
    )
  }
}

export const whitelistNpubs = sdk.Action.withInput(
  // id
  'whitelist-npubs',

  // metadata
  async ({ effects }) => ({
    name: i18n('Whitelisted npubs'),
    description: i18n(
      'Manage the additional npubs allowed to use the relay alongside you',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Access Control'),
    visibility: 'enabled',
  }),

  // form input specification
  whitelistSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    npubs: (await whitelistedNpubs.read().once()) || [],
  }),

  // the execution function
  async ({ effects, input }) => {
    rejectInvalid(input.npubs)
    await whitelistedNpubs.write(effects, input.npubs)
    // Haven only loads the whitelist file at startup, so restart to apply it.
    await effects.restart()
  },
)

export const blacklistNpubs = sdk.Action.withInput(
  // id
  'blacklist-npubs',

  // metadata
  async ({ effects }) => ({
    name: i18n('Blacklisted npubs'),
    description: i18n('Manage the npubs banned from posting to your relays'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Access Control'),
    visibility: 'enabled',
  }),

  // form input specification
  blacklistSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    npubs: (await blacklistedNpubs.read().once()) || [],
  }),

  // the execution function
  async ({ effects, input }) => {
    rejectInvalid(input.npubs)
    await blacklistedNpubs.write(effects, input.npubs)
    // Haven only loads the blacklist file at startup, so restart to apply it.
    await effects.restart()
  },
)
