#!/usr/bin/env bash

if [ -f .gitmodules ]; then
    if [ ! -f public_html/.git ]; then
        git submodule init
        git submodule update
    fi
fi

yarn run prod

# read -n 1 -s -r -p "Press any key to exit"