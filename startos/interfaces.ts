import { i18n } from './i18n'
import { sdk } from './sdk'
import { relayPort, relayInterfaceId } from './utils'

/**
 * Haven serves all four relays (and Blossom media over HTTP) on one port,
 * distinguished by path: outbox at /, private at /private, chat at /chat,
 * inbox at /inbox. One bound origin, four exported interfaces so each relay
 * URL is copyable from the StartOS UI.
 */
export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'websocket')
  const origin = await multi.bindPort(relayPort, {
    protocol: 'ws',
  })

  const outbox = sdk.createInterface(effects, {
    name: i18n('Outbox Relay'),
    id: relayInterfaceId,
    description: i18n(
      'Your public outbox relay. Also serves Blossom media over HTTP on the same host.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const privateRelay = sdk.createInterface(effects, {
    name: i18n('Private Relay'),
    id: 'private',
    description: i18n('Your private relay, for your eyes only'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/private',
    query: {},
  })

  const chat = sdk.createInterface(effects, {
    name: i18n('Chat Relay'),
    id: 'chat',
    description: i18n('Your DM relay, protected by web of trust'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/chat',
    query: {},
  })

  const inbox = sdk.createInterface(effects, {
    name: i18n('Inbox Relay'),
    id: 'inbox',
    description: i18n('Where others send notes that tag you'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '/inbox',
    query: {},
  })

  const receipt = await origin.export([outbox, privateRelay, chat, inbox])

  return [receipt]
})
