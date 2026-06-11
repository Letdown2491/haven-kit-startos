import { relaysBlastr, relaysImport } from '../fileModels/relayLists'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value, List } = sdk

const relayUrlPattern = {
  regex: '^wss?://[^\\s]+$',
  description: i18n('Must be a websocket URL starting with wss:// or ws://'),
}

const blastrSpec = InputSpec.of({
  relays: Value.list(
    List.text(
      {
        name: i18n('Blastr Relays'),
        description: i18n(
          'Public relays your outbox notes are re-broadcast to, so they reach the wider network',
        ),
      },
      {
        placeholder: 'wss://relay.damus.io',
        patterns: [relayUrlPattern],
      },
    ),
  ),
})

const importSpec = InputSpec.of({
  relays: Value.list(
    List.text(
      {
        name: i18n('Import Relays'),
        description: i18n(
          'Relays haven pulls your existing notes from when importing your history',
        ),
      },
      {
        placeholder: 'wss://relay.damus.io',
        patterns: [relayUrlPattern],
      },
    ),
  ),
})

export const blastrRelays = sdk.Action.withInput(
  // id
  'blastr-relays',

  // metadata
  async ({ effects }) => ({
    name: i18n('Blastr Relays'),
    description: i18n(
      'Manage the list of public relays your outbox notes are broadcast to',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configure'),
    visibility: 'enabled',
  }),

  // form input specification
  blastrSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    relays: (await relaysBlastr.read().once()) || [],
  }),

  // the execution function
  async ({ effects, input }) => relaysBlastr.write(effects, input.relays),
)

export const importRelays = sdk.Action.withInput(
  // id
  'import-relays',

  // metadata
  async ({ effects }) => ({
    name: i18n('Import Relays'),
    description: i18n(
      'Manage the list of seed relays used when importing your existing notes',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configure'),
    visibility: 'enabled',
  }),

  // form input specification
  importSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    relays: (await relaysImport.read().once()) || [],
  }),

  // the execution function
  async ({ effects, input }) => relaysImport.write(effects, input.relays),
)
