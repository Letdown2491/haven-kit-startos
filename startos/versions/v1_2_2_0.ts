import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Previous version, kept as a graph node so StartOS can compute the upgrade
// path to the current version. Do not edit; see UPDATING.md.
export const v1_2_2_0 = VersionInfo.of({
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
