// A resource server in OAuth2 parlance is an "API" in Auth0 parlance
resource "auth0_resource_server" "identity_api" {
  name        = "Identity API"
  identifier  = local.identity_v1_endpoint
  signing_alg = "RS256"

  // These are, by convention, permissions related to the user holding the token only
  // ie they do not mean "read any patron's info"
  // https://auth0.com/docs/configure/apis/add-api-permissions
  // Keep in alphabetical order to stop meaningless tf state changes
  scopes {
    value       = "create:requests"
    description = "Create item requests"
  }

  scopes {
    value       = "delete:patron"
    description = "Request deletion"
  }

  scopes {
    value       = "read:user"
    description = "Read user info"
  }

  scopes {
    value       = "read:requests"
    description = "Read item requests"
  }

  scopes {
    value       = "update:email"
    description = "Update email"
  }

  scopes {
    value       = "update:password"
    description = "Update password"
  }

  // Applications are allowed refresh tokens
  allow_offline_access                            = true
  token_lifetime                                  = 60 * 60 // 1 hour
  token_lifetime_for_web                          = 60 * 60 // 1 hour
  skip_consent_for_verifiable_first_party_clients = true
}

resource "auth0_client_grant" "dev_and_test" {
  for_each = toset(terraform.workspace == "stage" ? local.stage_test_client_ids : [])

  client_id = each.value
  audience  = auth0_resource_server.identity_api.identifier
  scope     = [for scope in auth0_resource_server.identity_api.scopes : scope.value]
}
