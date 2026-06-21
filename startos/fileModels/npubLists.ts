import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.array(z.string())

// Npubs allowed to use the relay alongside the owner: they can read and write
// the private relay, post to the outbox relay, and be tagged on the inbox
// relay. Haven always whitelists the owner implicitly, so an empty list keeps
// today's owner-only behaviour (see haven config.go).
export const whitelistedNpubs = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/config/whitelisted_npubs.json' },
  shape,
)

// Npubs hard-rejected from posting to any relay, overriding the whitelist and
// web of trust.
export const blacklistedNpubs = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/config/blacklisted_npubs.json' },
  shape,
)
