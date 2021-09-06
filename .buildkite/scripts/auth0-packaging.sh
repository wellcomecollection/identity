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
    "/app/packages/apps/auth0-actions/dist/login.js" \
    "/app/packages/apps/auth0-actions/dist/enrich_userinfo.js"
}

function __package_auth0_html() {
  mkdir -p /app/.buildkite/build/
  zip -vj "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" \
    "/app/html/auth0/login.html" \
    "/app/html/auth0/password_reset.html" \
    "/app/html/auth0/reset_email.html" \
    "/app/html/auth0/verify_email.html" \
    "/app/html/auth0/welcome_email.html" \
    "/app/html/auth0/blocked_account.html"
}

function __store_auth0_scripts() {
  aws s3 cp "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" "s3://identity-dist/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip"
}

function __store_auth0_html() {
  aws s3 cp "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" "s3://identity-dist/auth0-html-${NORMALIZED_BRANCH_NAME}.zip"
}

__package_auth0_scripts
__package_auth0_html
__store_auth0_scripts
__store_auth0_html
