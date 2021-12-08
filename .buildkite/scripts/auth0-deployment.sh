#!/bin/bash
set -o errexit

SCRIPTS_BUILD_DIR="/app/packages/auth0-database-scripts/dist"
ACTIONS_BUILD_DIR="/app/packages/auth0-actions/lib"
AUTH0_EXPORT_DIR="/app/.buildkite/build/auth0-export"
AUTH0_ACTIONS_FILE="/app/.buildkite/build/auth0-actions.json"

DATABASE_SCRIPTS="get_user login change_password change_email verify create delete"
ACTIONS="add_custom_claims"

function __do_deployment() {
  mkdir -p ${AUTH0_EXPORT_DIR}
  a0deploy export --format directory --output_folder "${AUTH0_EXPORT_DIR}/"

  # Deploy database scripts
  for script in ${DATABASE_SCRIPTS}
  do
    cp -v "${SCRIPTS_BUILD_DIR}/${script}.js" "${AUTH0_EXPORT_DIR}/database-connections/${AUTH0_CONNECTION_NAME}/"
  done

  # Deploy actions
  for action in ${ACTIONS}
  do
    action_name=$(jq ".names.${action}" ${AUTH0_ACTIONS_FILE})
    cp -v "${ACTIONS_BUILD_DIR}/${action}.js" "${AUTH0_EXPORT_DIR}/actions/${action_name}/code.js"
  done

  # Update action triggers
  jq .triggers ${AUTH0_ACTIONS_FILE} > ${AUTH0_EXPORT_DIR}/triggers/triggers.json

  a0deploy import --input_file "${AUTH0_EXPORT_DIR}/"
}

__do_deployment
