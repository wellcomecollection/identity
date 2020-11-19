#!/bin/bash


function __package_lambda() {
  local package_path="$1"
  local bundle_name="$2"
  local zip_file="$bundle_name-${BUILDKITE_BRANCH/\//-}.zip"

  echo "Packaging lambdas"

  echo $package_path
  echo "$bundle_name"
  echo "$zip_file"

  {
    rm "$package_path/$zip_file"

    cd "$package_path/lib" || return
    zip -r "../$zip_file" ./
    cd ../
    zip -ur "$zip_file" node_modules
  }

  aws s3 cp "$package_path/$zip_file" "s3://identity-dist/${zip_file}"
}

__package_lambda "packages/apps/api" "identity-api"
__package_lambda "packages/apps/api-authorizer" "identity-authorizer"
