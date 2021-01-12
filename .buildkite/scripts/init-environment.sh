#!/bin/bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __process_environment_variables() {
  export NORMALIZED_BRANCH_NAME="${BUILDKITE_BRANCH/\//-}"
}

function __process_buildkite_metadata() {
  # Need to revisit this - not sure we should be defaulting to 'stage' and 'v1'?
  if [ "${BUILDKITE_SOURCE}" == "ui" ]; then
    DEPLOY_ENVIRONMENT=$(buildkite-agent meta-data get deploy-environment)
    DEPLOY_API_GATEWAY_STAGE=$(buildkite-agent meta-data get deploy-api-gateway-stage)
  else
    DEPLOY_ENVIRONMENT=stage
    DEPLOY_API_GATEWAY_STAGE=v1
  fi

  export DEPLOY_ENVIRONMENT
  export DEPLOY_API_GATEWAY_STAGE
}

# shellcheck disable=SC1091
function __init_terraform_env_vars() {
  cd /app/infra/scoped && terraform init && terraform workspace select "${DEPLOY_ENVIRONMENT}"
  mkdir -p /app/.buildkite/build
  terraform output -json -no-color | jq -r .ci_environment_variables.value[] >/app/.buildkite/build/env.sh
  chmod +x /app/.buildkite/build/env.sh && source /app/.buildkite/build/env.sh && rm /app/.buildkite/build/env.sh
}

__process_environment_variables
__process_buildkite_metadata
__init_terraform_env_vars
