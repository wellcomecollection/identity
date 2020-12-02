# API Gateway endpoints

output "api_identity_v1_endpoint" {
  value = "https://${aws_api_gateway_domain_name.identity_v1.domain_name}/"
}

# Auth0 hostname

output "auth0_endpoint" {
  value = "https://${auth0_custom_domain.identity.domain}/"
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

output "auth0_client_buildkite" {
  value = <<EOF
Client Name: ${auth0_client.buildkite.name}
Client ID: ${auth0_client.buildkite.client_id}
Client Secret: ${auth0_client.buildkite.client_secret}
EOF
}

output "auth0_client_api_gateway_identity" {
  value = <<EOF
Client Name: ${auth0_client.api_gateway_identity.name}
Client ID: ${auth0_client.api_gateway_identity.client_id}
Client Secret: ${auth0_client.api_gateway_identity.client_secret}
EOF
}

# Environment variables

output "ci_environment_variables" {
  value = [
    "export AUTH0_DOMAIN=${aws_ssm_parameter.auth0_domain.value}",
    "export AUTH0_CLIENT_ID=${auth0_client.buildkite.client_id}",
    "export AUTH0_CLIENT_SECRET=${auth0_client.buildkite.client_secret}",
    "export AUTH0_CONNECTION_NAME=${auth0_connection.sierra.name}",
    "export API_GATEWAY_ID=${aws_api_gateway_rest_api.identity.id}",
    "export API_GATEWAY_AUTHORIZER_ID=${aws_api_gateway_authorizer.token_authorizer.id}",
    "export AWS_ACCOUNT_ID=${data.aws_caller_identity.current.account_id}"
  ]
}
