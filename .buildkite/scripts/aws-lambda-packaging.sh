#!/bin/bash
########################################################
# Script name : aws-lambda-packaging.sh
# Author      : Gary Tierney <gary.tierney@digirati.com>
########################################################

set -o errexit

function package_lambda() {
  local package_path="$1"
  local bundle_name="$2"
  local zip_file="$bundle_name-${BUILDKITE_BRANCH/\//-}.zip"

  echo "Packaging lambdas"

  echo "$package_path"
  echo "$bundle_name"
  echo "$zip_file"

  (
    cd "$package_path/lib" || return
    zip -r "/app/.buildkite/build/$zip_file" ./
    cd ../
    zip -ur "/app/.buildkite/build/$zip_file" node_modules
  )

  aws s3 cp "/app/.buildkite/build/$zip_file" "s3://identity-dist/${zip_file}"
}

__package_lambda "/app/packages/apps/api" "identity-api"
__package_lambda "/app/packages/apps/api-authorizer" "identity-authorizer"
