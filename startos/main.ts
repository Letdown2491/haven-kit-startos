import { havenEnv } from './fileModels/havenEnv'
import { IMPORT_REQUESTED, importMarker } from './fileModels/importMarker'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { relayPort, npubPattern, requiredNpubKeys } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting HAVEN'))

  // Reading these with .const() re-runs main (restarting the relay) whenever
  // an action writes them - haven only reads .env at startup, and the import
  // marker decides whether a one-shot import runs before the relay.
  const env = await havenEnv.read().const(effects)
  const importRequested =
    ((await importMarker.read().const(effects)) ?? '').trim() ===
    IMPORT_REQUESTED

  /**
   * ======================== Daemons ========================
   *
   * The image's entrypoint copies /haven-config/.env to /haven/.env on every
   * start and blocks until all npub settings are valid, so an unconfigured
   * install idles ("Awaiting configuration") instead of crash-looping.
   */
  const mounts = sdk.Mounts.of()
    .mountVolume({
      volumeId: 'main',
      subpath: 'config',
      mountpoint: '/haven-config',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'main',
      subpath: 'db',
      mountpoint: '/haven/db',
      readonly: false,
    })
    .mountVolume({
      volumeId: 'main',
      subpath: 'blossom',
      mountpoint: '/haven/blossom',
      readonly: false,
    })

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'haven' },
    mounts,
    'haven-sub',
  )

  const configured = requiredNpubKeys.every((key) =>
    npubPattern.test(env?.[key] ?? ''),
  )

  const primary = {
    subcontainer,
    exec: { command: sdk.useEntrypoint() },
    ready: {
      display: i18n('Relay'),
      fn: () =>
        configured
          ? sdk.healthCheck.checkPortListening(effects, relayPort, {
              successMessage: i18n('The relay is ready'),
              errorMessage: i18n('The relay is not ready'),
            })
          : {
              result: 'starting' as const,
              message: i18n(
                'Awaiting configuration - run Actions > Setup to enter your npub',
              ),
            },
    },
  }

  // When an import is requested (and the relay is configured - haven panics
  // otherwise), run haven --import as a oneshot first; the relay daemon
  // starts as soon as it completes. import.sh removes the marker when done,
  // so the import never re-runs unless requested again.
  if (configured && importRequested) {
    return sdk.Daemons.of(effects)
      .addOneshot('import', {
        subcontainer,
        exec: { command: ['/entrypoint.sh', '/import.sh'] },
        requires: [],
      })
      .addDaemon('primary', { ...primary, requires: ['import'] })
  }

  return sdk.Daemons.of(effects).addDaemon('primary', {
    ...primary,
    requires: [],
  })
})
