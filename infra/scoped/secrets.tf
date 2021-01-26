# Sierra API

resource "aws_secretsmanager_secret" "sierra_api_credentials" {
  name = "sierra-api-credentials-${terraform.workspace}"

  tags = merge(
    local.common_tags,
    {
      "Name" = "sierra-api-credentials-${terraform.workspace}"
    }
  )
}

data "aws_secretsmanager_secret_version" "sierra_api_credentials-sierra-api-key_version" {
  secret_id = aws_secretsmanager_secret.sierra_api_credentials.id
}

data "external" "sierra_api_credentials" {
  program = ["echo", data.aws_secretsmanager_secret_version.sierra_api_credentials-sierra-api-key_version.secret_string]
}

# Account Management System

resource "aws_secretsmanager_secret" "account_management_system-auth0_client_secret" {
  provider = "aws.experience"
  name     = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"
    }
  )
}

resource "aws_secretsmanager_secret_version" "account_management_system-auth0_client_secret" {
  provider      = "aws.experience"
  secret_id     = aws_secretsmanager_secret.account_management_system-auth0_client_secret.id
  secret_string = auth0_client.account_management_system.client_secret
}

resource "aws_secretsmanager_secret" "account_management_system-api_key" {
  provider = "aws.experience"
  name     = "identity/${terraform.workspace}/account_management_system/api_key"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
    }
  )
}

resource "aws_secretsmanager_secret_version" "account_management_system-api_key" {
  provider      = "aws.experience"
  secret_id     = aws_secretsmanager_secret.account_management_system-api_key.id
  secret_string = aws_api_gateway_api_key.account_management_system.value
}
