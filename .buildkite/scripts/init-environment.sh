#!/usr/bin/env bash
########################################################
# Script name : init-environment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

TF_BACKEND_ROLE_ARN="arn:aws:iam::770700576653:role/identity-ci"

function __process_environment_variables() {
  export AWS_DEFAULT_REGION=eu-west-1
  export TF_VAR_provider_role_arn=${TF_BACKEND_ROLE_ARN}
  export NORMALIZED_BRANCH_NAME="${BUILDKITE_BRANCH/\//-}"
  export DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT:=stage}
  export DEPLOY_API_GATEWAY_STAGE=${DEPLOY_API_GATEWAY_STAGE:=v1}
}

function __init_terraform_env_vars() {( set -e
  cd /app/infra/scoped && \
    terraform init \
    -backend-config "assume_role={\"role_arn\": \"${TF_BACKEND_ROLE_ARN}\"}" && \
    terraform workspace select "${DEPLOY_ENVIRONMENT}"
  mkdir -p /app/.buildkite/build
  terraform output -json -no-color | jq -r .ci_environment_variables.value[] >/app/.buildkite/build/env.sh
  terraform output -json -no-color | jq -r .auth0_actions.value >/app/.buildkite/build/auth0-actions.json
  chmod +x /app/.buildkite/build/env.sh && source /app/.buildkite/build/env.sh && rm /app/.buildkite/build/env.sh
)}

# add safe.directory to git config to account for 
# https://github.blog/open-source/git/git-security-vulnerability-announced/
git config --global --add safe.directory /app

__process_environment_variables

# get --init-terraform flag, if present, to initialise terraform
if [[ $* == *--init-terraform* ]]; then
  __init_terraform_env_vars
fi
