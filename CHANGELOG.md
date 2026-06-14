# Changelog

All notable changes to this StartOS package are documented here.

## [1.2.2:1] - 2026-06-14

### Fixed

- Reject invalid npubs during Setup and at startup. A mistyped npub (the right
  length and character set but an invalid bech32 checksum) previously passed the
  format check, reached haven, and made it panic on an undecodable npub —
  crash-looping the relay (issue #1). The npub's checksum is now verified both
  in the Setup action (`startos/actions/setup.ts`) and in `entrypoint.sh`, so a
  bad npub is rejected with a clear message instead.

### Changed

- Timezone in Advanced Settings is now a dropdown of IANA zone names instead of
  a free-text field, so an invalid entry can no longer be saved.

## [1.2.2:0] - 2026-06-11

### Added

- Initial StartOS package for HAVEN 1.2.2, built from upstream source at the
  pinned ref. Configuration via native StartOS actions (no web UI), four
  path-based relays plus a Blossom media server on port 3355, one-shot history
  import via the Import History action, and Tor declared as an optional
  dependency.
