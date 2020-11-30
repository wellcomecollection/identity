resource "aws_secretsmanager_secret" "sierra_api_credentials" {
  name = "sierra-api-credentials-${terraform.workspace}"
}

data "aws_secretsmanager_secret_version" "sierra_api_credentials-sierra-api-key_version" {
  secret_id = aws_secretsmanager_secret.sierra_api_credentials.id
}

data "external" "sierra_api_credentials" {
  program = ["echo", data.aws_secretsmanager_secret_version.sierra_api_credentials-sierra-api-key_version.secret_string]
}
