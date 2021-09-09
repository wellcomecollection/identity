# API Gateway V1

output "identity_v1_endpoint" {
  value = local.identity_v1_endpoint
}

output "identity_v1_docs_endpoint" {
  value = local.identity_v1_docs_endpoint
}

# Auth0

output "auth0_endpoint" {
  value     = local.auth0_endpoint
  sensitive = false
}

# Auth0 clients

output "auth0_client_dummy_name" {
  value = auth0_client.dummy_test.*.name
}

output "auth0_client_dummy_api_key" {
  value     = aws_api_gateway_api_key.dummy.*.value
  sensitive = true
}

output "auth0_client_dummy_client_id" {
  value = auth0_client.dummy_test.*.client_id
}

output "auth0_client_dummy_client_secret" {
  value     = auth0_client.dummy_test.*.client_secret
  sensitive = true
}

output "auth0_openathens_saml_idp_client_id" {
  value = auth0_client.openathens_saml_idp.client_id
}

# Environment variables (for CI / CD)

output "ci_environment_variables" {
  value = [
    "export AUTH0_DOMAIN=${aws_ssm_parameter.auth0_domain.value}",
    "export AUTH0_CLIENT_ID=${auth0_client.buildkite.client_id}",
    "export AUTH0_CLIENT_SECRET=${auth0_client.buildkite.client_secret}",
    "export AUTH0_CONNECTION_NAME=${auth0_connection.sierra.name}",
    "export AUTH0_ENRICH_USERINFO_RULE_NAME=${auth0_rule.enrich_userinfo.name}",
    "export API_GATEWAY_ID=${aws_api_gateway_rest_api.identity.id}",
    "export API_GATEWAY_AUTHORIZER_ID=${aws_api_gateway_authorizer.token_authorizer.id}",
    "export AWS_ACCOUNT_ID=${data.aws_caller_identity.current.account_id}",
    "export CLOUDFRONT_SWAGGER_UI_DISTRIBUTION_ID=${aws_cloudfront_distribution.swagger_ui_v1.id}",
    "export SMTP_PASS=${local.email_credentials["smtp_password"]}"
  ]

  sensitive = true
}
