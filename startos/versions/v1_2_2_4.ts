import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision,
// incremented for packaging-only changes (see UPDATING.md).
export const v1_2_2_4 = VersionInfo.of({
  version: '1.2.2:4',
  releaseNotes: {
    en_US:
      'Fix the relay crash ("primary daemon crashed" / open /proc/1/ns/pid) that happened right after a history import finished: the import now runs in its own subcontainer and no longer triggers a redundant restart, so the relay comes back cleanly when the import completes.',
    es_ES:
      'Corrige el fallo del relé («primary daemon crashed» / open /proc/1/ns/pid) que ocurría justo después de finalizar una importación del historial: la importación ahora se ejecuta en su propio subcontenedor y ya no provoca un reinicio redundante, de modo que el relé vuelve correctamente cuando la importación termina.',
    de_DE:
      'Behebt den Relay-Absturz („primary daemon crashed“ / open /proc/1/ns/pid), der direkt nach Abschluss eines Verlaufsimports auftrat: Der Import läuft nun in einem eigenen Subcontainer und löst keinen überflüssigen Neustart mehr aus, sodass das Relay nach Abschluss des Imports sauber wieder hochkommt.',
    pl_PL:
      'Naprawia awarię przekaźnika („primary daemon crashed” / open /proc/1/ns/pid) występującą tuż po zakończeniu importu historii: import działa teraz we własnym podkontenerze i nie wywołuje już zbędnego restartu, dzięki czemu przekaźnik czysto wraca do działania po zakończeniu importu.',
    fr_FR:
      'Corrige le plantage du relais (« primary daemon crashed » / open /proc/1/ns/pid) survenant juste après la fin d’un import de l’historique : l’import s’exécute désormais dans son propre sous-conteneur et ne déclenche plus de redémarrage redondant, de sorte que le relais redémarre proprement une fois l’import terminé.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
