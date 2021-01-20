#!/bin/bash
########################################################
# Script name : ams-deployment.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __deploy_service() {
  task_definition=$(aws ecs describe-task-definition \
      --task-definition "identity-account-management-system-${DEPLOY_ENVIRONMENT}" |
    jq '.taskDefinition | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities)'
  )

  log_definition=$(echo "${task_definition}" |
    jq '.containerDefinitions[] | select(.name == "fluentbit-log-router")'
  )

  app_definition=$(echo "${task_definition}" | jq '.containerDefinitions[] | select(.name == "account-management-system")')

  app_definition=$(echo "${app_definition}" |
    jq --arg account_id "${AWS_ACCOUNT_ID}" --arg region "${AWS_DEFAULT_REGION}" --arg tag "${NORMALIZED_BRANCH_NAME}" '.image = $account_id + ".dkr.ecr." + $region + ".amazonaws.com/identity-account-management-system:" + $tag'
  )

  task_definition=$(echo "${task_definition}" |
    jq --argjson log_definition "${log_definition}" --argjson app_definition "${app_definition}" '.containerDefinitions[1] = $log_definition | .containerDefinitions[0] = $app_definition'
  )

  task_info=$(aws ecs register-task-definition --cli-input-json "${task_definition}")

  revision=$(echo "${task_info}" | jq '.taskDefinition.revision')

  aws ecs update-service \
    --cluster "identity-cluster-${DEPLOY_ENVIRONMENT}" \
    --service "identity-account-management-system-${DEPLOY_ENVIRONMENT}" \
    --task-definition "identity-account-management-system-${DEPLOY_ENVIRONMENT}:${revision}" \
    --force-new-deployment
}

__deploy_service
