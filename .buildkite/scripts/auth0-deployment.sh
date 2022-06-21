#!/usr/bin/env bash
set -o errexit

SCRIPTS_BUILD_DIR="/app/packages/apps/auth0-database-scripts/dist"
ACTIONS_BUILD_DIR="/app/packages/apps/auth0-actions/lib"
AUTH0_EXPORT_DIR="/app/.buildkite/build/auth0-export"
AUTH0_ACTIONS_FILE="/app/.buildkite/build/auth0-actions.json"

DATABASE_SCRIPTS="get_user login change_password change_email verify create delete"
ACTIONS="add_custom_claims redirect_to_full_registration"

# We add this header to the Auth0 scripts to make it easier to debug
# what version of the code is actually running.
#
# We've had issues in the past where it wasn't obvious if changes were
# actually being deployed.
CURRENT_COMMIT=$(git rev-parse HEAD)
DEBUG_HEADER="// Set by $0 at $(date) (commit $CURRENT_COMMIT)"

# Use --env=true with a0deploy as per
# https://github.com/auth0/auth0-deploy-cli/issues/544

function __do_deployment() {
  mkdir -p ${AUTH0_EXPORT_DIR}
  a0deploy --env=true export --format directory --output_folder "${AUTH0_EXPORT_DIR}/"

  # Deploy database scripts
  for script in ${DATABASE_SCRIPTS}
  do
    dest_script="${AUTH0_EXPORT_DIR}/database-connections/${AUTH0_CONNECTION_NAME}/${script}.js"

    cp -v "${SCRIPTS_BUILD_DIR}/${script}.js" "$dest_script"
    echo -e "$DEBUG_HEADER\n\n$(cat "$dest_script")" > "$dest_script"
  done

  # Deploy actions
  for action in ${ACTIONS}
  do
    action_name=$(jq -r ".names.${action}" ${AUTH0_ACTIONS_FILE})

    dest_script="${AUTH0_EXPORT_DIR}/actions/${action_name}/code.js"

    cp -v "${ACTIONS_BUILD_DIR}/${action}.js" "$dest_script"
    echo -e "$DEBUG_HEADER\n\n$(cat "$dest_script")" > "$dest_script"
  done

  a0deploy --env=true import --input_file "${AUTH0_EXPORT_DIR}/"
}

__do_deployment
