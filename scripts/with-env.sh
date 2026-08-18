#!/bin/sh
# Run a command with database.env loaded, if it exists.
#
# Keeps the credential in one gitignored file rather than spread across shell
# history and per-terminal exports, so `npm run dev:demo` behaves the same
# whichever terminal it runs from.
set -a
[ -f ./database.env ] && . ./database.env
set +a
# `env` rather than a bare exec: the scripts this wraps carry inline
# assignments (`PORT=8181 npm run …`), which a shell only understands as part
# of a command line it is parsing — exec would look for a program called
# "PORT=8181".
exec env "$@"
