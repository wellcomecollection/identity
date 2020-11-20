#!/bin/bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

__package_auth0_scripts() {
  zip -vj "auth0-${NORMALIZED_BRANCH_NAME}.zip" "packages/apps/auth0-actions/src/get_user.js" "packages/apps/auth0-actions/src/login.js"
}

__store_auth0_scripts() {
  aws s3 cp "auth0-${NORMALIZED_BRANCH_NAME}.zip" "s3://identity-dist/auth0-${NORMALIZED_BRANCH_NAME}.zip"
}

__package_auth0_scripts
__store_auth0_scripts
