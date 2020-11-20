#!/bin/bash

if [ "$BUILDKITE_SOURCE" == "ui" ]; then
  export DEPLOY_ENVIRONMENT=$(buildkite-agent meta-data get deploy-environment)
  export DEPLOY_API_GATEWAY_STAGE=$(buildkite-agent meta-data get deploy-api-gateway-stage)
fi

cd infra/scoped && terraform init && terraform workspace select stage
terraform output -json -no-color | jq -r .ci_environment_variables.value[] > env.sh
chmod +x env.sh && source env.sh && rm env.sh
