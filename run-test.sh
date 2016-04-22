#!/bin/bash
echo "unit test"
exec /usr/src/app/node_modules/mocha/bin/_mocha tests/**/*.test.js -R spec
