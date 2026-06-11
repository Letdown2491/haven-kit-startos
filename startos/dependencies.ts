import { T } from '@start9labs/start-sdk'
import { havenEnv } from './fileModels/havenEnv'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // Read with .const() so this re-evaluates whenever the config changes.
  const relayUrl =
    (await havenEnv.read((env) => env.RELAY_URL ?? '').const(effects)) ?? ''
  const relayHost = relayUrl.replace(/:\d+$/, '')

  const deps: T.CurrentDependenciesResult<any> = {}

  // When the relay's public address is an onion, reachability (and the
  // Blossom media URLs haven derives from RELAY_URL) depends on the Tor
  // service running. Otherwise haven has no use for Tor: upstream has no
  // outbound proxy support, only ws://http:// scheme handling for .onion.
  if (relayHost.endsWith('.onion')) {
    deps.tor = {
      kind: 'running',
      versionRange: '>=0.4.9.5:0',
      healthChecks: ['tor'],
    }
  }

  return deps
})
