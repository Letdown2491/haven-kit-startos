import { sdk } from '../sdk'
import { setup } from './setup'
import { relayInfo } from './relayInfo'
import { advanced } from './advanced'
import { blastrRelays, importRelays } from './relayLists'

export const actions = sdk.Actions.of()
  .addAction(setup)
  .addAction(relayInfo)
  .addAction(advanced)
  .addAction(blastrRelays)
  .addAction(importRelays)
