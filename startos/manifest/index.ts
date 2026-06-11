import { setupManifest } from '@start9labs/start-sdk'
import { depTor, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'haven',
  title: 'HAVEN',
  license: 'MIT',
  packageRepo: 'https://github.com/Letdown2491/haven-kit-startos',
  upstreamRepo: 'https://github.com/barrydeen/haven',
  marketingUrl: 'https://github.com/barrydeen/haven',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    haven: {
      // Built locally from upstream source at the ref pinned by the
      // HAVEN_VERSION build arg in ./Dockerfile.
      source: {
        dockerBuild: {
          workdir: '.',
          dockerfile: 'Dockerfile',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    // On StartOS 0.4 Tor is a separate service (a url plugin): once installed,
    // users can add a .onion address to the relay interface, which the Setup
    // action then offers (and prefers) as the RELAY_URL.
    tor: {
      description: depTor,
      optional: true,
      metadata: {
        title: 'Tor',
        icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
      },
    },
  },
})
