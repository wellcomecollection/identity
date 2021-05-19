# Sierra API

resource "aws_secretsmanager_secret" "sierra_api_credentials" {
  name = "sierra-api-credentials-${terraform.workspace}"

  tags = {
    "Name" = "sierra-api-credentials-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "sierra_api_credentials-sierra-api-key_version" {
  secret_id = aws_secretsmanager_secret.sierra_api_credentials.id
}

data "external" "sierra_api_credentials" {
  program = ["echo", data.aws_secretsmanager_secret_version.sierra_api_credentials-sierra-api-key_version.secret_string]
}

# Azure AD

resource "aws_secretsmanager_secret" "azure_ad_client_secret" {
  name = "azure-ad-client-secret-${terraform.workspace}"

  tags = {
    "Name" = "azure-ad-client-secret-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "azure_ad_client_secret_version" {
  secret_id = aws_secretsmanager_secret.azure_ad_client_secret.id
}

# Email

resource "aws_secretsmanager_secret" "email_smtp_password_secret" {
  name = "email-smtp-password-secret-${terraform.workspace}"

  tags = {
    "Name" = "email-smtp-password-secret-${terraform.workspace}"
  }
}

data "aws_secretsmanager_secret_version" "email_smtp_password_secret_version" {
  secret_id = aws_secretsmanager_secret.email_smtp_password_secret.id
}

# Account Management System

resource "aws_secretsmanager_secret" "account_management_system-auth0_client_secret" {
  provider = aws.experience
  name     = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_management_system/auth0_client_secret"
  }
}

resource "aws_secretsmanager_secret_version" "account_management_system-auth0_client_secret" {
  provider      = aws.experience
  secret_id     = aws_secretsmanager_secret.account_management_system-auth0_client_secret.id
  secret_string = auth0_client.account_management_system.client_secret
}

resource "aws_secretsmanager_secret" "account_management_system-api_key" {
  provider = aws.experience
  name     = "identity/${terraform.workspace}/account_management_system/api_key"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_management_system/api_key"
  }
}

resource "aws_secretsmanager_secret_version" "account_management_system-api_key" {
  provider      = aws.experience
  secret_id     = aws_secretsmanager_secret.account_management_system-api_key.id
  secret_string = aws_api_gateway_api_key.account_management_system.value
}

# Account Admin System

resource "aws_secretsmanager_secret" "account_admin_system-auth0_client_secret" {
  name = "identity/${terraform.workspace}/account_admin_system/auth0_client_secret"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_admin_system/auth0_client_secret"
  }
}

resource "aws_secretsmanager_secret_version" "account_admin_system-auth0_client_secret" {
  secret_id     = aws_secretsmanager_secret.account_admin_system-auth0_client_secret.id
  secret_string = auth0_client.account_admin_system.client_secret
}

resource "aws_secretsmanager_secret" "account_admin_system-api_key" {
  name = "identity/${terraform.workspace}/account_admin_system/api_key"

  tags = {
    "Name" = "identity/${terraform.workspace}/account_admin_system/api_key"
  }
}

resource "aws_secretsmanager_secret_version" "account_admin_system-api_key" {
  secret_id     = aws_secretsmanager_secret.account_admin_system-api_key.id
  secret_string = aws_api_gateway_api_key.account_admin_system.value
}
