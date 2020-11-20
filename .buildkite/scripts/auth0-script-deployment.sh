#!/bin/bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

__retrieve_artifacts() {
  mkdir -p /app/.buildkite/build
  aws s3 cp "s3://identity-dist/auth0-${NORMALIZED_BRANCH_NAME}.zip" "/app/.buildkite/build/auth0-${NORMALIZED_BRANCH_NAME}.zip"
  unzip "/app/.buildkite/build/auth0-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/.buildkite/build/"
}

__do_deployment() {
  mkdir -p /app/.buildkite/build/auth0-export/
  a0deploy export --format directory --output_folder /app/.buildkite/build/auth0-export/
  cp -v /app/.buildkite/build/get_user.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/.buildkite/build/login.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  a0deploy import --input_file "/app/.buildkite/build/auth0-export/"
}

__retrieve_artifacts "${DEPLOY_WORKSPACE}"
__do_deployment "${DEPLOY_WORKSPACE}"
