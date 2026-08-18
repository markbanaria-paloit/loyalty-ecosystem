#!/bin/sh
# Run a command with database.env loaded, if it exists.
#
# Keeps the credential in one gitignored file rather than spread across shell
# history and per-terminal exports, so `npm run dev:demo` behaves the same
# whichever terminal it runs from.
set -a
[ -f ./database.env ] && . ./database.env
set +a
exec "$@"
