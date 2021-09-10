#!/usr/bin/env bash

AWS_CLI_PROFILE="identity-terraform"
IDENTITY_DEVELOPER_ARN="arn:aws:iam::770700576653:role/identity-developer"

# Starting caller-identity
#aws sts get-caller-identity

aws configure set region eu-west-1 --profile $AWS_CLI_PROFILE
aws configure set role_arn $IDENTITY_DEVELOPER_ARN --profile $AWS_CLI_PROFILE
aws configure set source_profile default --profile $AWS_CLI_PROFILE

# Assumed caller-identity
#aws sts get-caller-identity --profile identity-terraform

MAILTRAP_SERVICE_TOKEN=$(aws secretsmanager get-secret-value --secret-id "identity/mailtrap_api_key" --profile "$AWS_CLI_PROFILE" --output text --query 'SecretString')

MAILTRAP_SERVICE_TOKEN=$MAILTRAP_SERVICE_TOKEN terraform "$@"
