#!/bin/bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

export DEPLOY_WORKSPACE=deploy

__cleanup_workspace() {
  rm -rf "${1}" auth0-export/
}

__retrieve_artifacts() {
  aws s3 cp "s3://identity-dist/auth0-${NORMALIZED_BRANCH_NAME}.zip" "${1}/auth0-${NORMALIZED_BRANCH_NAME}.zip"
  unzip "${1}/auth0-${NORMALIZED_BRANCH_NAME}.zip" -d "${1}/"
}

__do_deployment() {
  a0deploy export --format directory --output_folder "${1}/auth0-export/"
  cp -v "${1}/get_user.js" "auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v "${1}/login.js" "auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  a0deploy import --input_file "${1}/auth0-export/"
}

__cleanup_workspace "${DEPLOY_WORKSPACE}"
__retrieve_artifacts "${DEPLOY_WORKSPACE}"
__do_deployment "${DEPLOY_WORKSPACE}"
