#!/usr/bin/env bash

# clean
if [ -d dist/ ]; then
	rm dist/ -r
fi

# eslint
eslint test/**/*.js lib/*.js

# build
babel lib/ -d dist/
