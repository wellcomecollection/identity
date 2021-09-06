# Dummy client
# For local development / testing of the login flows and stuff ¯\_(ツ)_/¯

resource "auth0_client" "dummy_test" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  name                 = "Dummy Test Client${local.environment_qualifier}"
  app_type             = "regular_web"
  is_first_party       = true
  custom_login_page_on = true

  grant_types = [
    "authorization_code",
    "password",
    "http://auth0.com/oauth/grant-type/password-realm"
  ]

  callbacks = [
    "https://${local.auth0_hostname}/login/callback",
    "https://oauth.pstmn.io/v1/callback",
    "https://oauth.pstmn.io/v1/browser-callback"
  ]

  lifecycle {
    ignore_changes = [
      custom_login_page_preview,
      custom_login_page
    ]
  }
}

# API Gateway / Lambda
# Lets the API Gateway and underlying Lambda Functions interact with the Auth0 Management API

resource "auth0_client" "api_gateway_identity" {
  name                 = "Identity Lambda API${local.environment_qualifier}"
  app_type             = "non_interactive"
  custom_login_page_on = false

  grant_types = [
    "client_credentials",
    "password",
    "http://auth0.com/oauth/grant-type/password-realm" // Required for testing of Auth0 credentials via the API
  ]

  # Allows us to provide the 'Auth0-Forwarded-For' header to requests, which causes the token endpoint to use the users
  # real IP address for brute-force-protection, instead of the backend API IP address.
  is_token_endpoint_ip_header_trusted = true

  lifecycle {
    ignore_changes = [
      custom_login_page_preview
    ]
  }
}

resource "auth0_client_grant" "api_gateway_identity" {
  client_id = auth0_client.api_gateway_identity.id
  audience  = "https://${aws_ssm_parameter.auth0_domain.value}/api/v2/"
  scope = [
    "read:users",
    "read:user_idp_tokens",
    "create:users",
    "update:users",
    "delete:users"
  ]
}

# Buildkite
# Lets the deployment pipeline interact with the Auth0 Management API, specifically using the Deploy CLI Tool
# (https://auth0.com/docs/extensions/deploy-cli-tool)

resource "auth0_client" "buildkite" {
  name                 = "Buildkite${local.environment_qualifier}"
  app_type             = "non_interactive"
  custom_login_page_on = false

  grant_types = [
    "client_credentials"
  ]

  lifecycle {
    ignore_changes = [
      custom_login_page_preview
    ]
  }
}

resource "auth0_client_grant" "buildkite" {
  client_id = auth0_client.buildkite.id
  audience  = "https://${aws_ssm_parameter.auth0_domain.value}/api/v2/"
  scope = [ # https://github.com/auth0/auth0-deploy-cli#pre-requisites
    "read:client_grants",
    "create:client_grants",
    "delete:client_grants",
    "update:client_grants",
    "read:clients",
    "update:clients",
    "delete:clients",
    "create:clients",
    "read:client_keys",
    "update:client_keys",
    "delete:client_keys",
    "create:client_keys",
    "read:connections",
    "update:connections",
    "delete:connections",
    "create:connections",
    "read:custom_domains",
    "read:resource_servers",
    "update:resource_servers",
    "delete:resource_servers",
    "create:resource_servers",
    "read:rules",
    "update:rules",
    "delete:rules",
    "create:rules",
    "read:hooks",
    "update:hooks",
    "delete:hooks",
    "create:hooks",
    "read:rules_configs",
    "update:rules_configs",
    "delete:rules_configs",
    "read:email_provider",
    "update:email_provider",
    "delete:email_provider",
    "create:email_provider",
    "read:tenant_settings",
    "update:tenant_settings",
    "read:grants",
    "delete:grants",
    "read:guardian_factors",
    "update:guardian_factors",
    "read:mfa_policies",
    "update:mfa_policies",
    "read:email_templates",
    "create:email_templates",
    "update:email_templates",
    "read:roles",
    "update:roles",
    "delete:roles",
    "create:roles",
    "read:prompts",
    "update:prompts",
    "read:branding",
    "update:branding",
    "read:actions"
  ]
}

# Account Management System
# Lets the Account Management System component initialise and process OAuth 2.0 / OIDC login requests through Auth0

resource "auth0_client" "account_management_system" {
  name                 = "Account Management System${local.environment_qualifier}"
  app_type             = "regular_web"
  is_first_party       = true
  custom_login_page_on = true

  grant_types = [
    "authorization_code"
  ]

  callbacks = [
    local.ams_redirect_uri
  ]

  allowed_logout_urls = [
    local.wellcome_collection_site_uri,
    local.ams_delete_requested_uri
  ]

  lifecycle {
    ignore_changes = [
      custom_login_page_preview,
      custom_login_page
    ]
  }
}

# Smoke Test Client
# For automated smoke testing after deployment

resource "auth0_client" "smoke_test" {
  name           = "Smoke Test Client${local.environment_qualifier}"
  app_type       = "regular_web"
  is_first_party = true

  # The password grant is used here as we consider this client running in CI
  # secure enough to allow that.
  grant_types = [
    "password"
  ]

  callbacks = []
}
