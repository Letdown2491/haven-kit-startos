import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Haven's .env on the config volume. The relay's entrypoint copies this file
 * to /haven/.env and exports it on every container start, so writes here take
 * effect on restart (main.ts reads this model with .const() so any write
 * restarts the relay automatically).
 *
 * The schema is a flat string map rather than an enumerated shape: haven has
 * ~80 settings and treats them all as env strings; the actions only manage
 * the subset users care about and must not destroy hand-added keys.
 */
const shape = z.record(z.string(), z.string())

// Haven reads the file with godotenv. Values are double-quoted on write so
// spaces and # in names/descriptions survive; quotes are stripped on read.
function unquote(value: string): string {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value
      .slice(1, -1)
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }
  return value
}

function quote(value: string): string {
  return (
    '"' +
    value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') +
    '"'
  )
}

function mapValues(
  record: Record<string, string>,
  fn: (value: string) => string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, fn(value)]),
  )
}

export const havenEnv = FileHelper.env(
  { base: sdk.volumes.main, subpath: '/config/.env' },
  shape,
  {
    onRead: (raw) => mapValues(raw, unquote),
    onWrite: (data) => mapValues(data, quote),
  },
)
