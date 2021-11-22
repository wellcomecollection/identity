#!/bin/bash
########################################################
# Script name : auth0-packaging.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __package_auth0_scripts() {
  mkdir -p /app/.buildkite/build/
  zip -vj "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" \
    "/app/packages/apps/auth0-actions/dist/get_user.js" \
    "/app/packages/apps/auth0-actions/dist/login.js"
}

function __store_auth0_scripts() {
  aws s3 cp "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" "s3://identity-dist/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip"
}

__package_auth0_scripts
__store_auth0_scripts
