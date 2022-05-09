#!/usr/bin/env bash
########################################################
# Script name : aws-lambda-deployment.sh
# Author      : Gary Tierney <gary.tierney@digirati.com>
########################################################

set -o errexit

function __update_alias_for_bundle() {
  local bundle_name="${1}"
  local zip_file="${bundle_name}-${BUILDKITE_COMMIT}.zip"
  local function_name="${bundle_name}-${DEPLOY_ENVIRONMENT}"

  local lambda_version
  lambda_version=$(aws lambda update-function-code \
      --function-name "${function_name}" \
      --s3-bucket "identity-dist" \
      --s3-key "${zip_file}" \
      --publish \
    | jq -r '.Version')

  aws lambda update-alias \
    --name "current" \
    --function-name "${function_name}" \
    --description "Current deployment" \
    --function-version "${lambda_version}"
}

function __deploy_api_gateway() {
  aws apigateway create-deployment \
    --rest-api-id "${API_GATEWAY_ID}" \
    --stage-name "${DEPLOY_API_GATEWAY_STAGE}"
}

__update_alias_for_bundle 'identity-api'
__update_alias_for_bundle 'identity-authorizer'
__update_alias_for_bundle 'patron-deletion-tracker'

__deploy_api_gateway
