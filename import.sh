#!/bin/sh
# One-shot history import for StartOS, run as a oneshot before the relay
# daemon (via entrypoint.sh so the synced .env is exported).
#
# "haven import" exits on its own when it finishes (it logs "tagged import
# complete" as its last step), so normally the FIFO simply reaches EOF. The
# watcher below is a safety net: if a future haven version keeps running after
# the import, the completion phrase triggers a SIGINT. Either way the marker
# file is always removed at the end - even after a failure - so the next start
# never re-runs (or loops) the import unless the user requests it again.

MARKER="/haven-config/import-requested"
FIFO="/tmp/haven-import.fifo"
PIDFILE="/tmp/haven-import.pid"

# Loud, greppable banners so the start/finish stand out in the StartOS log
# stream (which is otherwise full of RPC traffic). Look for "HAVEN IMPORT".
echo "========================================================"
echo ">>> HAVEN IMPORT STARTED - the relay will start when it finishes."
echo ">>> Lines below are haven's own import progress."
echo "========================================================"

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
                echo "========================================================"
                echo ">>> HAVEN IMPORT COMPLETE - stopping the import process."
                echo "========================================================"
                [ -f "$PIDFILE" ] && kill -INT "$(cat "$PIDFILE")" 2>/dev/null
                ;;
        esac
    done <"$FIFO"
) &

# Run haven in the foreground: a background job (&) would inherit SIGINT
# ignored from the non-interactive shell and be unkillable by the watcher.
# The import is a SUBCOMMAND ("haven import"), not a flag - "haven --import"
# is an undefined flag and makes haven exit 2 (ExitOnError) without importing.
sh -c "echo \$\$ >'$PIDFILE'; exec /haven/haven import" >"$FIFO" 2>&1
IMPORT_RC=$?

wait
rm -f "$FIFO" "$PIDFILE" "$MARKER"

# Surface haven's exit code so a failed import is not silently mistaken for a
# successful one. 0 = clean exit; 130/143 = our watcher SIGINT/SIGTERM after it
# saw the completion phrase (also fine). Anything else is a real failure - most
# notably code 2, which is what a bad invocation (e.g. an undefined flag) gives.
case "$IMPORT_RC" in
    0 | 130 | 143)
        echo "========================================================"
        echo ">>> HAVEN IMPORT FINISHED (exit $IMPORT_RC) - starting the relay now."
        echo ">>> The service status will return to Running shortly."
        echo "========================================================"
        ;;
    *)
        echo "========================================================"
        echo ">>> HAVEN IMPORT FAILED - 'haven import' exited with code $IMPORT_RC."
        echo ">>> No notes were imported. See the lines above for haven's error."
        echo ">>> The relay will still start normally."
        echo "========================================================"
        ;;
esac
