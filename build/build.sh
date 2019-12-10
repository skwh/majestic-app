#!/bin/bash

nvm use

echo "Cleaning dist....."
rm -rf ./dist/
mkdir dist
mkdir dist/config

echo "Starting webpack....."
webpack --env.production=$1

echo "Copying web server...."
cp -v ./src/*.js ./dist/
cp -v ./config/.web.env ./dist/config/

