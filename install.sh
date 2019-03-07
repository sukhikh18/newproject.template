#!/usr/bin/env bash

if [ -f .git/index ]; then
    git pull
    if [ -f public_html/config.js ]; then
        echo "Submodule already exists. Try pull updates."
        cd  public_html
        git pull
    else
        git submodule init
        git submodule update

        if [ -f public_html/.git ]; then
            cd  public_html
            git checkout master
            git pull origin master
        else
            echo "Git submodule not exists. Check .gitmodules"
            exit 0
        fi
    fi
else
    echo "Try clone submodule. git required!"
    rmdir ./public_html
    git clone https://github.com/nikolays93/newproject.template.git public_html
    cd  public_html
fi

cd ./..
yarn run prod

# read -n 1 -s -r -p "Press any key to exit"