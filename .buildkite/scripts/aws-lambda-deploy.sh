#!/bin/bash

bundle_name="$1"
environment="$2"
version=${BUILDKITE_BRANCH/\//-}
zip_file="$bundle_name-$version.zip"

#  this is the id of the API gateway for stage, how can we better plug this together? use `terraform output`?
apigw_id="m7u12kxh7k"

lambda_version=$(aws lambda update-function-code \
    --function-name "$bundle_name-$environment" \
    --s3-bucket identity-dist --s3-key "$zip_file" | jq .Version)

aws lambda create-alias --function-name "$bundle_name-$environment" \
 --description "$version" --function-version "$lambda_version" --name "$version"

for resource in "users_userid_delete" "users_userid_put"; do
  # hm, we need _all_ of the info in a put? we can't patch it?
  # todo: this doesn't work
  aws apigateway put-integration --rest-api-id "$apigw_id" --resource-id "$resource" --http-method POST --type AWS_PROXY --integration-http-method POST --uri arn:aws:apigateway:$AWS_REGION:lambda:path/2015-03-31/functions/$functionArn:$GIT_SHA/invocations
done

aws apigateway create-deployment --rest-api-id "$apigw_id" --stage-name v1
