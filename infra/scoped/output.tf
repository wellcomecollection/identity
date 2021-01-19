# API Gateway V1

output "identity_v1_endpoint" {
  value = local.identity_v1_endpoint
}

output "identity_v1_docs_endpoint" {
  value = local.identity_v1_docs_endpoint
}

# Auth0

output "auth0_endpoint" {
  value = local.auth0_endpoint
}

# Auth0 clients

output "auth0_client_dummy-test" {
  value = <<EOF
Client Name: ${auth0_client.dummy_test.name}
API Key: ${aws_api_gateway_api_key.dummy.value}
Client ID: ${auth0_client.dummy_test.client_id}
Client Secret: ${auth0_client.dummy_test.client_secret}"
EOF
}

# Environment variables (for CI / CD)

output "ci_environment_variables" {
  value = [
    "export AUTH0_DOMAIN=${aws_ssm_parameter.auth0_domain.value}",
    "export AUTH0_CLIENT_ID=${auth0_client.buildkite.client_id}",
    "export AUTH0_CLIENT_SECRET=${auth0_client.buildkite.client_secret}",
    "export AUTH0_CONNECTION_NAME=${auth0_connection.sierra.name}",
    "export AUTH0_ENRICH_PATRON_ATTRIBUTES_RULE_NAME=${auth0_rule.enrich_patron_attributes.name}",
    "export API_GATEWAY_ID=${aws_api_gateway_rest_api.identity.id}",
    "export API_GATEWAY_AUTHORIZER_ID=${aws_api_gateway_authorizer.token_authorizer.id}",
    "export AWS_ACCOUNT_ID=${data.aws_caller_identity.current.account_id}",
    "export CLOUDFRONT_SWAGGER_UI_DISTRIBUTION_ID=${aws_cloudfront_distribution.swagger_ui_v1.id}",
    "export SMTP_PASS=${aws_iam_access_key.auth0_email.ses_smtp_password_v4}"
  ]
}
