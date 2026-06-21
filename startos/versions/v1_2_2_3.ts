import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision,
// incremented for packaging-only changes (see UPDATING.md).
export const v1_2_2_3 = VersionInfo.of({
  version: '1.2.2:3',
  releaseNotes: {
    en_US:
      'History import reliability: the import now runs the correct "haven import" subcommand, restarts the service explicitly when requested, and logs clear progress banners with haven\'s exit code so it is obvious whether the import ran.',
    es_ES:
      'Fiabilidad de la importación del historial: ahora ejecuta el subcomando correcto «haven import», reinicia el servicio explícitamente cuando se solicita y registra mensajes de progreso claros con el código de salida de haven, de modo que es evidente si la importación se ejecutó.',
    de_DE:
      'Zuverlässigkeit des Verlaufsimports: Der Import führt nun den korrekten Unterbefehl „haven import“ aus, startet den Dienst auf Anforderung explizit neu und protokolliert klare Fortschrittsmeldungen mit dem Exit-Code von haven, sodass ersichtlich ist, ob der Import gelaufen ist.',
    pl_PL:
      'Niezawodność importu historii: import uruchamia teraz poprawne podpolecenie „haven import”, jawnie restartuje usługę na żądanie i zapisuje czytelne komunikaty postępu wraz z kodem wyjścia haven, dzięki czemu wiadomo, czy import się wykonał.',
    fr_FR:
      'Fiabilité de l’import de l’historique : l’import exécute désormais la bonne sous-commande « haven import », redémarre le service explicitement lorsqu’il est demandé et journalise des messages de progression clairs avec le code de sortie de haven, de sorte qu’il est évident que l’import s’est exécuté.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
