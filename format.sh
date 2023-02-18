#!/bin/bash

# delete unnecessary files
rm ./dist/tsconfig.app.tsbuildinfo
rm ./dist/src/main.d.ts

# delete unnecessary folders
rm -rf ./dist/src/tests
rm -rf ./dist/src/helper

# replace path alias '@' with '..'
find ./dist -type f -name "*.d.ts" -exec sed -i 's/@/../g' {} +
