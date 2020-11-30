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
  if [ "${BUILDKITE_SOURCE}" == "ui" ]; then
    DEPLOY_ENVIRONMENT=$(buildkite-agent meta-data get deploy-environment)
    export DEPLOY_ENVIRONMENT

    DEPLOY_API_GATEWAY_STAGE=$(buildkite-agent meta-data get deploy-api-gateway-stage)
    export DEPLOY_API_GATEWAY_STAGE
  fi
}

# shellcheck disable=SC1091
function __init_terraform_env_vars() {
  cd /app/infra/scoped && terraform init && terraform workspace select stage
  mkdir -p /app/.buildkite/build
  terraform output -json -no-color | jq -r .ci_environment_variables.value[] >/app/.buildkite/build/env.sh
  chmod +x /app/.buildkite/build/env.sh && source /app/.buildkite/build/env.sh && rm /app/.buildkite/build/env.sh
}

__process_environment_variables
__process_buildkite_metadata
__init_terraform_env_vars
