#!/bin/bash
########################################################
# Script name : auth0-deployment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __retrieve_artifacts() {
  mkdir -p /app/.buildkite/build
  aws s3 cp "s3://identity-dist/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip"
  aws s3 cp "s3://identity-dist/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip"
  unzip "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/.buildkite/build/"
  unzip "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/.buildkite/build/"
}

function __do_deployment() {
  mkdir -p /app/.buildkite/build/auth0-export/
  a0deploy export --format directory --output_folder /app/.buildkite/build/auth0-export/
  cp -v /app/.buildkite/build/get_user.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/.buildkite/build/login.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/.buildkite/build/login.html "/app/.buildkite/build/auth0-export/pages/"
  cp -v /app/.buildkite/build/password_reset.html "/app/.buildkite/build/auth0-export/pages/"
  cp -v /app/.buildkite/build/reset_email.html "/app/.buildkite/build/auth0-export/emails/"
  cp -v /app/.buildkite/build/verify_email.html "/app/.buildkite/build/auth0-export/emails/"
  a0deploy import --input_file "/app/.buildkite/build/auth0-export/"
}

__retrieve_artifacts
__do_deployment