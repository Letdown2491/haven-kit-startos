import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision.
export const current = VersionInfo.of({
  version: '1.2.2:0',
  releaseNotes: {
    en_US: 'Initial StartOS package for HAVEN 1.2.2.',
    es_ES: 'Paquete inicial de StartOS para HAVEN 1.2.2.',
    de_DE: 'Erstes StartOS-Paket für HAVEN 1.2.2.',
    pl_PL: 'Początkowy pakiet StartOS dla HAVEN 1.2.2.',
    fr_FR: 'Premier paquet StartOS pour HAVEN 1.2.2.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
