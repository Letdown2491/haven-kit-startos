import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision,
// incremented for packaging-only changes (see UPDATING.md).
export const v1_2_2_2 = VersionInfo.of({
  version: '1.2.2:2',
  releaseNotes: {
    en_US:
      'Fix history import. It was invoked as "haven --import" (an undefined flag), so it exited immediately and imported nothing, and the marker that requests it did not reliably restart the service. It now runs correctly: the action restarts the service explicitly, and the import logs report progress and haven\'s exit code so failures are no longer silent.',
    es_ES:
      'Corrige la importación del historial. Se invocaba como «haven --import» (una opción inexistente), por lo que terminaba de inmediato sin importar nada, y el marcador que la solicita no reiniciaba el servicio de forma fiable. Ahora funciona correctamente: la acción reinicia el servicio explícitamente y los registros de la importación muestran el progreso y el código de salida de haven, de modo que los fallos ya no son silenciosos.',
    de_DE:
      'Behebt den Verlaufsimport. Er wurde als „haven --import“ (eine nicht definierte Option) aufgerufen und beendete sich daher sofort, ohne etwas zu importieren, und der anfordernde Marker startete den Dienst nicht zuverlässig neu. Er funktioniert nun korrekt: Die Aktion startet den Dienst explizit neu, und die Importprotokolle zeigen den Fortschritt und den Exit-Code von haven an, sodass Fehler nicht mehr stillschweigend bleiben.',
    pl_PL:
      'Naprawia import historii. Był wywoływany jako „haven --import” (nieistniejąca flaga), więc kończył działanie natychmiast, nic nie importując, a znacznik żądania nie restartował niezawodnie usługi. Teraz działa poprawnie: akcja jawnie restartuje usługę, a dzienniki importu pokazują postęp i kod wyjścia haven, dzięki czemu błędy nie są już ciche.',
    fr_FR:
      'Corrige l’import de l’historique. Il était lancé via « haven --import » (une option inexistante), il se terminait donc immédiatement sans rien importer, et le marqueur qui le demande ne redémarrait pas le service de façon fiable. Il fonctionne désormais correctement : l’action redémarre explicitement le service, et les journaux d’import indiquent la progression et le code de sortie de haven, de sorte que les échecs ne sont plus silencieux.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
