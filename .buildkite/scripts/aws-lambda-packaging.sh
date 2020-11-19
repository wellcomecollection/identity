#!/bin/bash


function __package_lambda() {
  local package_path="$1"
  local bundle_name="$2"
  local zip_file ="$bundle_name-${BUILDKITE_BRANCH/\//-}.zip"

  {
    rm "$package_path/$zip_file"

    cd "$package_path/lib"
    rm "../$zip_file"

    zip -r "../$zip_file" ./
    cd ../
    zip -ur "$zip_file" node_modules
  }

  aws s3 cp "$package_path/.zip" "s3://identity-dist/${zip_file}"
}
