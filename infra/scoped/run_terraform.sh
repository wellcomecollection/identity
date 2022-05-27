#!/usr/bin/env bash

set -o errexit
set -o nounset

TERRAFORM_WORKSPACE=$(terraform workspace show)

# If you don't select a workspace, the commands further down will fail
# with non-obvious errors about non-existent Parameters and Secrets.
if [[ "$TERRAFORM_WORKSPACE" != "stage" ]] && [[ "$TERRAFORM_WORKSPACE" != "prod" ]]
then
  echo "You must select a workspace before continuing, e.g. 'terraform workspace select stage'"
  exit 1
fi

AWS_CLI_PROFILE="identity-terraform"
IDENTITY_DEVELOPER_ARN="arn:aws:iam::770700576653:role/identity-developer"

AUTH0_DOMAIN_SSM="identity-auth0_domain-$TERRAFORM_WORKSPACE"
CLIENT_ID_SSM="/identity/$TERRAFORM_WORKSPACE/buildkite/auth0_client_id"
CLIENT_SECRET_SM="identity/$TERRAFORM_WORKSPACE/buildkite/auth0_client_secret"

# Starting caller-identity
#aws sts get-caller-identity

aws configure set region eu-west-1 --profile $AWS_CLI_PROFILE
aws configure set role_arn $IDENTITY_DEVELOPER_ARN --profile $AWS_CLI_PROFILE
aws configure set source_profile default --profile $AWS_CLI_PROFILE

# Assumed caller-identity
#aws sts get-caller-identity --profile identity-terraform

AUTH0_DOMAIN=$(aws ssm get-parameter --name "$AUTH0_DOMAIN_SSM" --profile "$AWS_CLI_PROFILE" --output text --query 'Parameter.Value')
AUTH0_CLIENT_ID=$(aws ssm get-parameter --name "$CLIENT_ID_SSM" --profile "$AWS_CLI_PROFILE" --output text --query 'Parameter.Value')
AUTH0_CLIENT_SECRET=$(aws secretsmanager get-secret-value --secret-id "$CLIENT_SECRET_SM" --profile "$AWS_CLI_PROFILE" --output text --query 'SecretString')

AUTH0_DOMAIN=$AUTH0_DOMAIN \
  AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID \
  AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET \
  terraform "$@"
