#!/bin/bash

export zip_file="auth0-${BUILDKITE_BRANCH/\//-}.zip"

echo "Packaging Auth0 scripts..."

zip -vj "${zip_file}.zip" "packages/apps/auth0-actions/src/get_user.js" "packages/apps/auth0-actions/src/login.js"
aws s3 cp "${zip_file}.zip" "s3://identity-dist/${zip_file}"
