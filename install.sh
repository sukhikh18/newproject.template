#!/usr/bin/env bash

if [ -f .gitmodules ]; then
    if [ ! -f public_html/.git ]; then
        git submodule init
        git submodule update
    fi
fi

read -n 1 -s -r -p "Do you want git check out?"

yarn run prod
