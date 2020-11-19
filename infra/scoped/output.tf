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
