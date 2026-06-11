import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.array(z.string())

// Relays your outbox notes are broadcast (blasted) to.
export const relaysBlastr = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/config/relays_blastr.json' },
  shape,
)

// Seed relays haven pulls your existing notes from.
export const relaysImport = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/config/relays_import.json' },
  shape,
)
