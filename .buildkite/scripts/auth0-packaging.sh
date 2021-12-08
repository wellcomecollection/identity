#!/bin/bash
########################################################
# Script name : auth0-packaging.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __package_auth0_scripts() {
  mkdir -p /app/.buildkite/build/
  zip -vj "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" \
    "/app/packages/apps/auth0-database-scripts/dist/get_user.js" \
    "/app/packages/apps/auth0-database-scripts/dist/login.js" \
    "/app/packages/apps/auth0-database-scripts/dist/change_password.js" \
    "/app/packages/apps/auth0-database-scripts/dist/change_email.js" \
    "/app/packages/apps/auth0-database-scripts/dist/verify.js" \
    "/app/packages/apps/auth0-database-scripts/dist/create.js" \
    "/app/packages/apps/auth0-database-scripts/dist/delete.js"
}

function __store_auth0_scripts() {
  aws s3 cp "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" "s3://identity-dist/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip"
}

__package_auth0_scripts
__store_auth0_scripts
