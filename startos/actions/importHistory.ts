import { havenEnv } from '../fileModels/havenEnv'
import { IMPORT_REQUESTED, importMarker } from '../fileModels/importMarker'
import { relaysImport } from '../fileModels/relayLists'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { npubPattern, requiredNpubKeys } from '../utils'

export const importHistory = sdk.Action.withoutInput(
  // id
  'import-history',

  // metadata
  async ({ effects }) => ({
    name: i18n('Import History'),
    description: i18n(
      'Pull your existing notes from the configured import relays into your outbox and inbox. Progress is shown in the service logs.',
    ),
    warning: i18n(
      'The relay restarts and stays offline while the import runs. This can take several minutes.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configure'),
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const env = await havenEnv.read().once()
    const configured = requiredNpubKeys.every((key) =>
      npubPattern.test(env?.[key] ?? ''),
    )
    if (!configured) {
      return {
        version: '1' as const,
        title: i18n('Not configured'),
        message: i18n(
          'Run the Setup action first - the import needs your npub.',
        ),
        result: null,
      }
    }

    const seeds = (await relaysImport.read().once()) || []
    if (seeds.length === 0) {
      return {
        version: '1' as const,
        title: i18n('No import relays'),
        message: i18n(
          'Add at least one relay with the Import Relays action first, so haven knows where to pull your notes from.',
        ),
        result: null,
      }
    }

    await importMarker.write(effects, IMPORT_REQUESTED)

    // main reads the marker with .const(), which is meant to restart the
    // service automatically on write - but that depends on a filesystem watch
    // that does not fire on all StartOS hosts when the marker file is *created*
    // for the first time (unlike the always-seeded .env). Without a restart the
    // import would silently never run, so trigger it explicitly here.
    await effects.restart()

    return {
      version: '1' as const,
      title: i18n('Import scheduled'),
      message: i18n(
        'The relay is restarting to run the import. While it runs the service status shows "Importing history"; it returns to Running on its own when the import finishes. Detailed progress is in the service logs.',
      ),
      result: null,
    }
  },
)

export const cancelImport = sdk.Action.withoutInput(
  // id
  'cancel-import',

  // metadata
  async ({ effects }) => ({
    name: i18n('Cancel Import'),
    description: i18n(
      'Cancel the pending or running history import and start the relay normally',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configure'),
    visibility:
      (await importMarker.read().const(effects))?.trim() === IMPORT_REQUESTED
        ? 'enabled'
        : 'hidden',
  }),

  // the execution function
  async ({ effects }) => {
    await importMarker.write(effects, 'cancelled')
    // Same reason as the import action: don't rely on the file watch to restart.
    await effects.restart()

    return {
      version: '1' as const,
      title: i18n('Import cancelled'),
      message: i18n('The relay is restarting normally.'),
      result: null,
    }
  },
)
