#!/bin/sh
# Wrapper entrypoint that keeps Haven's runtime .env in sync with the
# shared configuration volume before starting the relay.

set -e

CONFIG_ENV="/haven-config/.env"
TARGET_ENV="/haven/.env"

# Copy and load the latest configuration if it exists in the shared volume.
sync_config() {
    if [ -f "$CONFIG_ENV" ]; then
        # Ensure the target directory exists (it will, but this is harmless).
        mkdir -p "$(dirname "$TARGET_ENV")"
        cp "$CONFIG_ENV" "$TARGET_ENV"

        # Haven expects RELAY_URL to be a bare hostname (it prepends wss:// and
        # https:// itself), so strip any scheme or trailing path that a
        # hand-edited config may contain - otherwise Blossom media URLs come out
        # malformed (https://wss://...).
        sed -E -i \
            -e 's|^(RELAY_URL="?)[a-zA-Z][a-zA-Z0-9+.-]*://|\1|' \
            -e 's|^(RELAY_URL="?[^"/ ]+)/[^"]*|\1|' \
            "$TARGET_ENV"

        # Export all variables from the configuration so they override any stale
        # environment values that may have been baked into the container.
        set -a
        # shellcheck disable=SC1090
        . "$TARGET_ENV"
        set +a
    else
        # Guarantee the relay still has an .env file to read.
        touch "$TARGET_ENV"
    fi
}

# Haven panics on a missing or invalid npub (owner and all four per-relay
# npubs are required), so a fresh, unconfigured install would crash-loop. A
# real npub is "npub1" plus 58 bech32 characters; anything else (empty, the
# template placeholder, ...) means "not set up yet".
BECH32_CHARSET="qpzry9x8gf2tvdw0s3jn54khce6mua7l"

# Verify an npub's bech32 checksum (caller has already checked the format with
# the regex below). Haven decodes the npub with nip19 and panics on a bad
# checksum, so a well-formed but mistyped npub (e.g. hand-edited into the .env)
# would crash-loop without this. Mirrors isValidNpub() in startos/utils.ts.
npub_checksum_ok() {
    data="${1#npub1}"
    # hrp-expanded "npub" prefix + separator (constant), then each data value.
    values="3 3 3 3 0 14 16 21 2"
    while [ -n "$data" ]; do
        ch="${data%"${data#?}"}"
        data="${data#?}"
        rest="${BECH32_CHARSET%%"$ch"*}"
        [ "$rest" = "$BECH32_CHARSET" ] && return 1
        values="$values ${#rest}"
    done
    chk=1
    for v in $values; do
        b=$(( chk >> 25 ))
        chk=$(( ((chk & 0x1ffffff) << 5) ^ v ))
        [ $(( b        & 1 )) -eq 1 ] && chk=$(( chk ^ 0x3b6a57b2 ))
        [ $(( (b >> 1) & 1 )) -eq 1 ] && chk=$(( chk ^ 0x26508e6d ))
        [ $(( (b >> 2) & 1 )) -eq 1 ] && chk=$(( chk ^ 0x1ea119fa ))
        [ $(( (b >> 3) & 1 )) -eq 1 ] && chk=$(( chk ^ 0x3d4233dd ))
        [ $(( (b >> 4) & 1 )) -eq 1 ] && chk=$(( chk ^ 0x2a1462b3 ))
    done
    [ "$chk" -eq 1 ]
}

is_configured() {
    for npub in "${OWNER_NPUB:-}" "${PRIVATE_RELAY_NPUB:-}" "${CHAT_RELAY_NPUB:-}" \
                "${OUTBOX_RELAY_NPUB:-}" "${INBOX_RELAY_NPUB:-}"; do
        printf '%s' "$npub" | grep -Eq '^npub1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$' || return 1
        npub_checksum_ok "$npub" || return 1
    done
}

sync_config

if ! is_configured; then
    echo "HAVEN is not configured yet: one or more npub settings are missing or still placeholders."
    echo "Open the Haven Kit app and complete the setup wizard - the relay will start automatically once configured."
    while ! is_configured; do
        sleep 5
        sync_config
    done
    echo "Configuration detected - starting HAVEN."
fi

exec "$@"
