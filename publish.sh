#!/bin/bash

set -e

if [ -z "$1" ]; then
    msg="Updates"
else
    msg="$1"
fi

tsc --noEmit

rm -rf dist

tsc

git add .
git commit -m "$msg"
git push

bun publish
