#!/bin/bash
########################################################
# Script name : aws-lambda-deployment.sh
# Author      : Gary Tierney <gary.tierney@digirati.com>
########################################################

set -o errexit
# TODO: if this fails at any point a lot of things could be left in a bad state.

export AWS_DEFAULT_REGION=eu-west-1

function __create_alias_for_bundle() {
  local bundle_name="${1}"
  local zip_file="${bundle_name}-${NORMALIZED_BRANCH_NAME}.zip"
  local function_name="${bundle_name}-${DEPLOY_ENVIRONMENT}"

  local lambda_version
  lambda_version=$(aws lambda update-function-code \
      --function-name "${function_name}" \
      --s3-bucket "identity-dist" \
      --s3-key "${zip_file}" \
      --publish \
    | jq -r '.Version')

  local alias_operation
  if aws lambda get-alias --function-name "${function_name}" --name "${NORMALIZED_BRANCH_NAME}" >&2; then
    alias_operation=update
  else
    alias_operation=create
  fi

  aws lambda ${alias_operation}-alias \
    --function-name "${function_name}" \
    --description "${NORMALIZED_BRANCH_NAME}" \
    --function-version "${lambda_version}" \
    --name "${NORMALIZED_BRANCH_NAME}" \
    | jq -r '.AliasArn'

  if aws lambda get-policy --function-name "${function_name}" --qualifier "${NORMALIZED_BRANCH_NAME}" >&2; then
    aws lambda remove-permission \
      --function-name "${function_name}" \
      --statement-id "AllowAPIGatewayInvoke" \
      --qualifier "${NORMALIZED_BRANCH_NAME}"
  fi

  aws lambda add-permission \
    --function-name "${function_name}" \
    --statement-id "AllowAPIGatewayInvoke" \
    --action "lambda:InvokeFunction" \
    --principal "apigateway.amazonaws.com" \
    --source-arn "arn:aws:execute-api:${AWS_DEFAULT_REGION}:${AWS_ACCOUNT_ID}:${API_GATEWAY_ID}/*/*" \
    --qualifier "${NORMALIZED_BRANCH_NAME}" >&2
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

function __deploy_lambda_authorizer() {
  # shellcheck disable=SC2140
  aws apigateway update-authorizer \
    --rest-api-id "${API_GATEWAY_ID}" \
    --authorizer-id "${API_GATEWAY_AUTHORIZER_ID}" \
    --patch-operations=op=replace,path="/authorizerUri",value="arn:aws:apigateway:${AWS_DEFAULT_REGION}:lambda:path/2015-03-31/functions/${api_auth_lambda_arn}/invocations"
}

function __deploy_api_gateway() {
  aws apigateway create-deployment \
    --rest-api-id "${API_GATEWAY_ID}" \
    --stage-name "${DEPLOY_API_GATEWAY_STAGE}"
}

api_lambda_arn=$(__create_alias_for_bundle 'identity-api')
api_auth_lambda_arn=$(__create_alias_for_bundle 'identity-authorizer')

while true; do
  args=(apigateway get-resources --max-items 100 --rest-api-id "${API_GATEWAY_ID}")

  if [ -v NEXT_TOKEN ]; then
    args+=(--starting-token "${pagination_token}")
  fi

  output=$(aws "${args[@]}")
  pagination_token=$(jq -r ".NextToken" <<<"${output}")

  # https://xkcd.com/1319/
  while read -r index; do
    id=$(jq -r --arg index "$index" '.items[$index|tonumber] | .id' <<<"${output}")

    while read -r method; do

      request_params=$(aws apigateway get-integration \
          --rest-api-id "${API_GATEWAY_ID}" \
          --resource-id "${id}" \
          --http-method="${method}" \
        | jq -r '.requestParameters // {}')

      aws apigateway put-integration \
        --rest-api-id "${API_GATEWAY_ID}" \
        --resource-id "${id}" \
        --integration-http-method "POST" \
        --http-method "${method}" \
        --request-parameters="${request_params}" \
        --type "AWS_PROXY" \
        --uri "arn:aws:apigateway:${AWS_DEFAULT_REGION}:lambda:path/2015-03-31/functions/${api_lambda_arn}/invocations"

    done < <(jq -r --arg index "${index}" '.items[$index|tonumber] | .resourceMethods | keys | .[]' <<<"${output}")
  done < <(jq -r '.items | to_entries | .[].key' <<<"${output}")

  [[ "${pagination_token}" != "null" ]] || break
done

__deploy_lambda_authorizer
__deploy_api_gateway
__deploy_api_documentation
