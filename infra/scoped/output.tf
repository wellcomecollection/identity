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

output "auth0_openathens_saml_idp_client_id" {
  value = auth0_client.openathens_saml_idp.client_id
}

output "auth0_iiif_image_api_client_id" {
  value = auth0_client.iiif_image_api.client_id
}

# Environment variables (for CI / CD)

output "ci_environment_variables" {
  value = [
    "export AUTH0_DOMAIN=${local.auth0_domain}",
    "export AUTH0_CLIENT_ID=${auth0_client.buildkite.client_id}",
    "export AUTH0_CLIENT_SECRET=${auth0_client.buildkite.client_secret}",
    "export AUTH0_CONNECTION_NAME=${auth0_connection.sierra.name}",
    "export API_GATEWAY_ID=${aws_api_gateway_rest_api.identity.id}",
    "export API_GATEWAY_AUTHORIZER_ID=${aws_api_gateway_authorizer.token_authorizer.id}",
    "export AWS_ACCOUNT_ID=${data.aws_caller_identity.current.account_id}",
    "export SMTP_PASS=${local.email_credentials["smtp_password"]}"
  ]

  sensitive = true
}

output "auth0_actions" {
  value = {
    names = {
      add_custom_claims             = auth0_action.add_custom_claims.name
      redirect_to_full_registration = auth0_action.redirect_to_full_registration.name
    }
  }
}
