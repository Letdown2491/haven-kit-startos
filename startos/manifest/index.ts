import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

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
  dependencies: {},
})
