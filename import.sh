#!/bin/sh
# One-shot history import for StartOS, run as a oneshot before the relay
# daemon (via entrypoint.sh so the synced .env is exported).
#
# haven --import does not exit when it finishes; like haven-kit's config UI,
# watch its output for the completion phrases and SIGINT it. The marker file
# is always removed at the end - even after a failure - so the next start
# never re-runs (or loops) the import unless the user requests it again.

MARKER="/haven-config/import-requested"
FIFO="/tmp/haven-import.fifo"
PIDFILE="/tmp/haven-import.pid"

echo "Starting history import - the relay will start when it finishes."

rm -f "$FIFO" "$PIDFILE"
mkfifo "$FIFO"

# Watcher: mirror haven's output to the service logs and SIGINT it once a
# completion phrase appears. Exits on EOF when haven terminates.
(
    while IFS= read -r line; do
        printf '%s\n' "$line"
        lower=$(printf '%s' "$line" | tr 'A-Z' 'a-z')
        case "$lower" in
            *"tagged import complete"* | *"please restart the relay"*)
                echo "Import complete - stopping the import process."
                [ -f "$PIDFILE" ] && kill -INT "$(cat "$PIDFILE")" 2>/dev/null
                ;;
        esac
    done <"$FIFO"
) &

# Run haven in the foreground: a background job (&) would inherit SIGINT
# ignored from the non-interactive shell and be unkillable by the watcher.
sh -c "echo \$\$ >'$PIDFILE'; exec /haven/haven --import" >"$FIFO" 2>&1

wait
rm -f "$FIFO" "$PIDFILE" "$MARKER"
echo "History import finished - starting the relay."
