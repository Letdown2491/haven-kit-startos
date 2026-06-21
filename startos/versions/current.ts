import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Version tracks upstream haven (the Dockerfile pins v1.2.2 + the .onion
// relay URL prefix fix); the suffix after ":" is the package revision,
// incremented for packaging-only changes (see UPDATING.md).
export const current = VersionInfo.of({
  version: '1.2.2:5',
  releaseNotes: {
    en_US:
      'Add Whitelisted npubs and Blacklisted npubs actions: let other people use your relay alongside you by whitelisting their npubs, or ban abusive keys with the blacklist. The relay restarts to apply the change.',
    es_ES:
      'Añade las acciones «Npubs en lista blanca» y «Npubs en lista negra»: permite que otras personas usen tu relé junto a ti añadiendo sus npubs a la lista blanca, o veta claves abusivas con la lista negra. El relé se reinicia para aplicar el cambio.',
    de_DE:
      'Fügt die Aktionen „Npubs auf der Whitelist“ und „Npubs auf der Blacklist“ hinzu: Lass andere Personen dein Relay mitnutzen, indem du ihre Npubs auf die Whitelist setzt, oder sperre missbräuchliche Schlüssel über die Blacklist. Das Relay startet neu, um die Änderung zu übernehmen.',
    pl_PL:
      'Dodaje akcje „Npuby na białej liście” i „Npuby na czarnej liście”: pozwól innym osobom korzystać z Twojego przekaźnika, dodając ich npuby do białej listy, lub zablokuj nadużywające klucze za pomocą czarnej listy. Przekaźnik restartuje się, aby zastosować zmianę.',
    fr_FR:
      'Ajoute les actions « Npubs en liste blanche » et « Npubs en liste noire » : laissez d’autres personnes utiliser votre relais à vos côtés en ajoutant leurs npubs à la liste blanche, ou bannissez les clés abusives avec la liste noire. Le relais redémarre pour appliquer le changement.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
