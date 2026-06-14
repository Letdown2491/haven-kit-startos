import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision,
// incremented for packaging-only changes (see UPDATING.md).
export const current = VersionInfo.of({
  version: '1.2.2:1',
  releaseNotes: {
    en_US:
      'Reject invalid npubs during Setup and at startup, so a mistyped npub is caught with a clear message instead of crash-looping the relay.',
    es_ES:
      'Rechaza npubs no válidos durante la configuración y al iniciar, de modo que un npub mal escrito se detecta con un mensaje claro en lugar de provocar un bucle de fallos del relé.',
    de_DE:
      'Lehnt ungültige npubs bei der Einrichtung und beim Start ab, sodass ein falsch eingegebener npub mit einer klaren Meldung erkannt wird, statt das Relay in einer Absturzschleife zu blockieren.',
    pl_PL:
      'Odrzuca nieprawidłowe npub-y podczas konfiguracji i przy starcie, dzięki czemu błędnie wpisany npub jest wychwytywany czytelnym komunikatem zamiast powodować pętlę awarii przekaźnika.',
    fr_FR:
      'Rejette les npubs invalides lors de la configuration et au démarrage, afin qu’un npub mal saisi soit détecté avec un message clair au lieu de faire planter le relais en boucle.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
