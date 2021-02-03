#!/bin/bash
########################################################
# Script name : auth0-deployment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __retrieve_artifacts() {
  mkdir -p /app/.buildkite/build
  aws s3 cp "s3://identity-dist/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip"
  aws s3 cp "s3://identity-dist/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip"
  unzip "/app/.buildkite/build/auth0-scripts-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/.buildkite/build/"
  unzip "/app/.buildkite/build/auth0-html-${NORMALIZED_BRANCH_NAME}.zip" -d "/app/.buildkite/build/"
}

function __do_deployment() {
  mkdir -p /app/.buildkite/build/auth0-export/
  a0deploy export --format directory --output_folder /app/.buildkite/build/auth0-export/

  cp -v /app/.buildkite/build/get_user.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/.buildkite/build/login.js "/app/.buildkite/build/auth0-export/database-connections/${AUTH0_CONNECTION_NAME}/"
  cp -v /app/.buildkite/build/login.html "/app/.buildkite/build/auth0-export/pages/"
  cp -v /app/.buildkite/build/password_reset.html "/app/.buildkite/build/auth0-export/pages/"
  cp -v /app/.buildkite/build/reset_email.html "/app/.buildkite/build/auth0-export/emails/"
  cp -v /app/.buildkite/build/verify_email.html "/app/.buildkite/build/auth0-export/emails/"
  cp -v /app/.buildkite/build/welcome_email.html "/app/.buildkite/build/auth0-export/emails/"
  cp -v /app/.buildkite/build/enrich_patron_attributes.js "/app/.buildkite/build/auth0-export/rules/${AUTH0_ENRICH_PATRON_ATTRIBUTES_RULE_NAME}.js"

  azure_ad_profile_script=$(sed -E ':a;N;$!ba;s/\r{0,1}\n/\\n/g' "/app/.buildkite/build/create_azure_ad_profile.js")
  jq --arg azure_ad_profile_script "${azure_ad_profile_script}" '.options.scripts.fetchUserProfile=$azure_ad_profile_script' "/app/.buildkite/build/auth0-export/connections/AzureAD-Connection.json" | sponge "/app/.buildkite/build/auth0-export/connections/AzureAD-Connection.json"

  a0deploy import --input_file "/app/.buildkite/build/auth0-export/"
}

__retrieve_artifacts
__do_deployment
