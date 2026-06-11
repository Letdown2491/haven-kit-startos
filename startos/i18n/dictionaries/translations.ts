import { LangDict } from './default'

// No translations yet - every language falls back to English (en_US).
// To add a language, provide a complete LangDict keyed by the indices in
// default.ts, e.g. es_ES: { 0: 'Iniciando HAVEN', ... }.
export default {} satisfies Record<string, LangDict>
