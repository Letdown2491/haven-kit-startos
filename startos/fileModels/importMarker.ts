import { FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Marker requesting a one-shot history import (haven --import) on next start.
 * The Import History action writes 'requested'; main.ts reads it with
 * .const() (so the write restarts the service) and runs the import oneshot
 * before the relay daemon when set. import.sh deletes the file when the
 * import finishes - success or failure - so imports never re-run or loop.
 */
export const importMarker = FileHelper.string({
  base: sdk.volumes.main,
  subpath: '/config/import-requested',
})

export const IMPORT_REQUESTED = 'requested'
