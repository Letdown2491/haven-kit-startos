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
  // Build marker - bump this string every change so you can confirm in the
  // service logs that the newly sideloaded code is actually running (StartOS
  // may not replace an install of the same version number).
  console.info('HAVEN StartOS package build: 1.2.2:4')

  // Read the .env with .const() so any action that writes it re-runs main and
  // restarts the relay (haven only reads .env at startup).
  const env = await havenEnv.read().const(effects)
  // The import marker is read with .once(), NOT .const(): the Import History
  // and Cancel Import actions trigger the re-run explicitly via effects.restart().
  // If this were .const(), import.sh deleting the marker at the end of the
  // import would fire the watch and kick off a SECOND restart that collides
  // with the import->primary handoff already underway - the `/proc/1/ns/pid`
  // "primary daemon crashed" race from issue #1.
  const importRequested =
    ((await importMarker.read().once()) ?? '').trim() === IMPORT_REQUESTED

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
  // otherwise), run "haven import" as a oneshot first; the primary relay daemon
  // requires it and starts as soon as it completes. import.sh removes the
  // marker when done, so the import never re-runs unless requested again.
  //
  // The import runs in its OWN subcontainer (separate guid/leader), not the
  // primary's. Sharing one subcontainer means the import's PID 1 exits when the
  // import finishes and the primary then re-launches a new PID 1 in that same,
  // just-vacated container - the window where StartOS' runtime fails to find
  // PID 1 (`open /proc/1/ns/pid: No such file`, "primary daemon crashed",
  // issue #1). A dedicated import subcontainer keeps that leader churn away from
  // the relay's container.
  if (configured && importRequested) {
    console.info(
      'HAVEN: import requested - starting history import oneshot before the relay',
    )
    const importSubcontainer = await sdk.SubContainer.of(
      effects,
      { imageId: 'haven' },
      mounts,
      'haven-import-sub',
    )
    return sdk.Daemons.of(effects)
      .addOneshot('import', {
        subcontainer: importSubcontainer,
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
