#!/bin/bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

__retrieve_artifacts() {
  aws s3 cp "s3://identity-dist/auth0-${NORMALIZED_BRANCH_NAME}.zip" "/app/build/auth0-${NORMALIZED_BRANCH_NAME}.zip"
  unzip -v "/app/build/auth0-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/build/"
}

__do_deployment() {
  a0deploy export --format directory --output_folder /app/build/auth0-export/
  cp -v /app/build/get_user.js "/app/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/build/login.js "/app/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  a0deploy import --input_file "/app/build/auth0-export/"
}

__retrieve_artifacts "${DEPLOY_WORKSPACE}"
__do_deployment "${DEPLOY_WORKSPACE}"
