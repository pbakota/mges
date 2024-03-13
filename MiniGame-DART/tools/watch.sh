#!/usr/bin/env bash
trap exit SIGQUIT SIGINT
echo -en "Running build in watch mode, press Ctrl+c to exit ...\n"

while :; do
  watch -n2 -g ls -l src && make build
done
