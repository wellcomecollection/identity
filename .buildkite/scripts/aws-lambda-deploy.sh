#!/bin/bash

set -o errexit
# TODO: if this fails at any point a lot of things could be left in a bad state.

export AWS_DEFAULT_REGION=eu-west-1

function __create_alias_for_bundle() {
  local bundle_name="$1"
  local zip_file="$bundle_name-$NORMALIZED_BRANCH_NAME.zip"
  local lambda_version=$(aws lambda update-function-code \
    --function-name "$bundle_name-$DEPLOY_ENVIRONMENT" \
    --s3-bucket identity-dist --s3-key "$zip_file" | jq .Version)

  aws lambda create-alias --function-name "$bundle_name-$DEPLOY_ENVIRONMENT" \
    --description "$NORMALIZED_BRANCH_NAME" \
    --function-version "$lambda_version" \
    --name "$NORMALIZED_BRANCH_NAME" | jq -r '.AliasArn'
}

api_lambda_arn=$(__create_alias_for_bundle 'identity-api')
api_auth_lambda_arn=$(__create_alias_for_bundle 'identity-authorizer')

while true; do
  args=(apigateway get-resources --max-items 100 --rest-api-id "$API_GATEWAY_ID")

  if [ -v NEXT_TOKEN ]; then
    args+=(--starting-token "$pagination_token")
  fi

  output=$(aws "${args[@]}")
  pagination_token=$(jq -r ".NextToken" <<<"$output")

  # https://xkcd.com/1319/
  while read -r index; do
    id=$(jq -r --arg index $index '.items[$index|tonumber] | .id')

    while read -r method; do
      aws apigateway put-integration \
        --rest-api-id "$API_GATEWAY_ID" \
        --resource-id "$id" \
        --integration-http-method "$method" \
        --http-method "$method" \
        --type AWS_PROXY \
        --uri "$api_lambda_arn"
    done < <(jq -r --arg index $index '.items[$index|tonumber] | .resourceMethods | keys | .[]' <<<"$output")
  done < <(jq -r '.items | to_entries | .[].key' <<<"$output")

  [[ "$pagination_token" != "null" ]] || break
done

aws apigateway update-authorizer \
  --rest-api-id "$API_GATEWAY_ID" \
  --authorizer-id "$API_GATEWAY_AUTHORIZER_ID" \
  --patch-operations=op=replace,path="/authorizerUri",value="$api_auth_lambda_arn"

aws apigateway create-deployment --rest-api-id "$API_GATEWAY_ID" --stage-name "$DEPLOY_API_GATEWAY_STAGE"
