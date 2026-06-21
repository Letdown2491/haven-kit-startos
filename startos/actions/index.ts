import { sdk } from '../sdk'
import { setup } from './setup'
import { relayInfo } from './relayInfo'
import { advanced } from './advanced'
import { blastrRelays, importRelays } from './relayLists'
import { blacklistNpubs, whitelistNpubs } from './npubLists'
import { cancelImport, importHistory } from './importHistory'

export const actions = sdk.Actions.of()
  .addAction(setup)
  .addAction(relayInfo)
  .addAction(advanced)
  .addAction(whitelistNpubs)
  .addAction(blacklistNpubs)
  .addAction(blastrRelays)
  .addAction(importRelays)
  .addAction(importHistory)
  .addAction(cancelImport)
