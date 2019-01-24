#!/usr/bin/env bash

git pull
git submodule init
git submodule update
cd  public_html
git checkout master
git pull origin master

read -n 1 -s -r -p "Press any key to exit"