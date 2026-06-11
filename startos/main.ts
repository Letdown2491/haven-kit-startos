import { havenEnv } from './fileModels/havenEnv'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { relayPort, npubPattern, requiredNpubKeys } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   */
  console.info(i18n('Starting HAVEN'))

  // Reading the config with .const() re-runs main (restarting the relay)
  // whenever an action writes the file - haven only reads .env at startup.
  const env = await havenEnv.read().const(effects)

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

  return sdk.Daemons.of(effects).addDaemon('primary', {
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
              result: 'starting',
              message: i18n(
                'Awaiting configuration - run Actions > Setup to enter your npub',
              ),
            },
    },
    requires: [],
  })
})
