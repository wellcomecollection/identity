# API Gateway Keys

output "api_key-dummy" {
  value = aws_api_gateway_api_key.dummy.value
}

# Auth0 Clients

output "auth0_client-dummy-client_id" {
  value = auth0_client.dummy_test.client_id
}

output "auth0_client-dummy-client_secret" {
  value = auth0_client.dummy_test.client_secret
}
