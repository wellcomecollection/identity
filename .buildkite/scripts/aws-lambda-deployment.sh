#!/bin/bash
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

function __deploy_api_documentation() {
  # Check if a documentation version already exists and, if it does, detach it from the stage and delete it.
  if aws apigateway get-documentation-version --rest-api-id "${API_GATEWAY_ID}" --documentation-version "${DEPLOY_API_GATEWAY_STAGE}" >&2; then
    aws apigateway update-stage \
      --rest-api-id "${API_GATEWAY_ID}" \
      --stage-name "${DEPLOY_API_GATEWAY_STAGE}" \
      --patch-operations op=replace,path=/documentationVersion,value=""

    aws apigateway delete-documentation-version \
      --rest-api-id "${API_GATEWAY_ID}" \
      --documentation-version "${DEPLOY_API_GATEWAY_STAGE}"
  fi

  # Create a new documentation version.
  aws apigateway create-documentation-version \
    --rest-api-id "${API_GATEWAY_ID}" \
    --documentation-version "${DEPLOY_API_GATEWAY_STAGE}" \
    --stage-name "${DEPLOY_API_GATEWAY_STAGE}"

  # Generate a Swagger YAML export from the API Gateway documentation.
  aws apigateway get-export \
    --rest-api-id "${API_GATEWAY_ID}" \
    --stage-name "${DEPLOY_API_GATEWAY_STAGE}" \
    --export-type "swagger" \
    --accept "application/yaml" \
    "/tmp/identity.yaml"

  # Upload the Swagger YAML export into the S3 bucket which serves the Swagger UI.
  aws s3 cp \
    "/tmp/identity.yaml" \
    "s3://identity-public-swagger-ui-${DEPLOY_API_GATEWAY_STAGE}-${DEPLOY_ENVIRONMENT}/"

  # Invalidate the CloudFront distribution that sits in front of the Swagger UI S3 bucket, so that changes are rendered
  # ASAP.
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_SWAGGER_UI_DISTRIBUTION_ID}" \
    --paths "/*"
}

function __deploy_api_gateway() {
  aws apigateway create-deployment \
    --rest-api-id "${API_GATEWAY_ID}" \
    --stage-name "${DEPLOY_API_GATEWAY_STAGE}"
}

__update_alias_for_bundle 'identity-api'
__update_alias_for_bundle 'identity-authorizer'

__deploy_api_gateway
__deploy_api_documentation
