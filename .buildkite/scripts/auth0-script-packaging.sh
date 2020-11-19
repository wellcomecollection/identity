#!/bin/bash

export ZIP_NAME=auth0-${BUILDKITE_BRANCH/\//-}.zip

mkdir -p dist/
zip -v -j "dist/${ZIP_NAME}.zip" "packages/apps/auth0-actions/src/get-user.js" "packages/apps/auth0-actions/src/login.js"
aws s3 cp "dist/${ZIP_NAME}.zip" "s3://identity-dist/${ZIP_NAME}"
