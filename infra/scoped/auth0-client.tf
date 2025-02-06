# For local development / testing of the identity web app

resource "auth0_client" "local_dev_client" {
  # Only deploy the dummy client if it's a non-production environment...
  count = lower(terraform.workspace) != "prod" ? 1 : 0

  name                 = "Local dev client${local.environment_qualifier}"
  app_type             = "regular_web"
  is_first_party       = true
  custom_login_page_on = true

  jwt_configuration {
    alg = "RS256"
  }

  grant_types = auth0_client.identity_web_app.grant_types

  callbacks = concat(
    [
      for url in auth0_client.identity_web_app.callbacks :
      replace(url, local.wellcome_collection_site_uri, "http://localhost:3000")
    ],
    [
      for url in auth0_client.identity_web_app.callbacks :
      replace(url, local.wellcome_collection_site_uri, "http://localhost:3003")
    ],
    [
      for url in auth0_client.identity_web_app.callbacks :
      replace(url, local.wellcome_collection_site_uri, "https://www-dev.wellcomecollection.org")
    ]
  )

  allowed_logout_urls = concat(
    [
      for url in auth0_client.identity_web_app.allowed_logout_urls :
      replace(url, local.wellcome_collection_site_uri, "http://localhost:3000")
    ],
    [
      for url in auth0_client.identity_web_app.allowed_logout_urls :
      replace(url, local.wellcome_collection_site_uri, "http://localhost:3003")
    ],
    [
      for url in auth0_client.identity_web_app.allowed_logout_urls :
      replace(url, local.wellcome_collection_site_uri, "https://www-dev.wellcomecollection.org")
    ]
  )

  lifecycle {
    ignore_changes = [
      custom_login_page
    ]
  }
}

# Patron deletion tracker
resource "auth0_client" "deletion_tracker" {
  name                 = "Patron Deletion Tracker${local.environment_qualifier}"
  app_type             = "non_interactive"
  custom_login_page_on = false

  grant_types = ["client_credentials"]
}

resource "auth0_client_grant" "deletion_tracker" {
  client_id = auth0_client.deletion_tracker.id

  # Management API
  audience = "https://${local.auth0_domain}/api/v2/"
  scope = [
    "delete:users"
  ]
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
}

resource "auth0_client_grant" "api_gateway_identity" {
  client_id = auth0_client.api_gateway_identity.id
  audience  = "https://${local.auth0_domain}/api/v2/"
  scope = [
    "read:users",
    "update:users",
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
}

resource "auth0_client_grant" "buildkite" {
  client_id = auth0_client.buildkite.id
  audience  = "https://${local.auth0_domain}/api/v2/"
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
    "create:actions",
    "read:actions",
    "update:actions",
    "delete:actions",
    "deploy:actions",
    "read:organizations",
    "update:organizations",
    "create:organizations",
    "delete:organizations",
    "create:organization_connections",
    "read:organization_connections",
    "update:organization_connections",
    "delete:organization_connections",
    "create:log_streams",
    "read:log_streams",
    "update:log_streams",
    "delete:log_streams",
    "read:connections_options", # https://auth0.com/docs/troubleshoot/product-lifecycle/deprecations-and-migrations EOL April 24, 2025
    "update:connections_options"
  ]
}

# Identity web app
# Lets the identity web app initialise and process OAuth 2.0 / OIDC login requests through Auth0

resource "auth0_client" "identity_web_app" {
  name        = "Identity web app${local.environment_qualifier}"
  description = "The identity web app, as defined in the wellcomecollection.org repo"

  app_type             = "regular_web"
  is_first_party       = true
  custom_login_page_on = true
  oidc_conformant      = true
  initiate_login_uri   = local.front_end_login_uri

  jwt_configuration {
    alg = "RS256"
  }

  refresh_token {
    rotation_type           = "rotating"
    expiration_type         = "expiring"
    token_lifetime          = local.session_absolute_lifetime_hours * local.one_hour_s
    infinite_token_lifetime = false
    // This is actually ignored due to the below, just here to stop tf churn because for
    // some reason it can't be changed from this value
    idle_token_lifetime          = (local.session_absolute_lifetime_hours * local.one_hour_s) - 1
    infinite_idle_token_lifetime = true
    // This value *may* have an effect on intermittent refresh token errors
    // See: https://github.com/wellcomecollection/identity/issues/277#issuecomment-1077632386
    leeway = 120
  }

  grant_types = [
    "authorization_code",
    "client_credentials",
    "refresh_token"
  ]

  callbacks = [
    local.front_end_redirect_uri
  ]

  allowed_logout_urls = [
    local.wellcome_collection_site_uri,
    "${local.wellcome_collection_site_uri}/account/success",
    local.front_end_delete_requested_uri
  ]

  lifecycle {
    ignore_changes = [
      custom_login_page
    ]
  }
}

resource "auth0_client_grant" "identity_web_app" {
  client_id = auth0_client.identity_web_app.client_id
  audience  = auth0_resource_server.identity_api.identifier

  // Be explicit about these scopes so as not to accidentally give too many permissions
  scope = [
    "create:requests",
    "delete:patron",
    "read:user",
    "read:requests",
    "send:verification-emails",
    "update:email",
    "update:password"
  ]
}

# OpenAthens SAML Identity Provider
# Allows OpenAthens to authenticate users against the Auth0 user-pool

resource "auth0_client" "openathens_saml_idp" {
  name           = "OpenAthens SAML IDP${local.environment_qualifier}"
  app_type       = "regular_web"
  is_first_party = true

  // This appears to be the login URL for the OpenAthens org (it isn't secret)
  // It's here as per https://auth0.com/docs/authenticate/login/auth0-universal-login/configure-default-login-routes
  // in order (hopefully) to prevent warnings during login as described in the above docs
  initiate_login_uri = "https://login.openathens.net/auth/wellcome.org/o/72496070"

  callbacks = [
    data.aws_secretsmanager_secret_version.openathens_callback_url.secret_string
  ]

  addons {
    samlp {
      // This stops us mapping claims which we haven't explicitly provided below
      passthrough_claims_with_no_mapping = true
      map_unknown_claims_as_is           = false

      mappings = {
        user_id     = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        email       = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        name        = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        given_name  = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
        family_name = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        upn         = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"
        groups      = "http://schemas.xmlsoap.org/claims/Group"
        // The app_metadata attributes get flattened into the user object and so this maps
        // to the 'role' property on app_metadata
        // This uses the role claim that Microsoft define
        // https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-saml-tokens
        role = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      }
      name_identifier_probes = [
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ]
    }
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

resource "auth0_client" "iiif_image_api" {
  name                          = "IIIF Image API${local.environment_qualifier}"
  app_type                      = "regular_web"
  is_first_party                = true
  organization_require_behavior = "no_prompt"

  # The password grant is used here as we consider this client running in CI
  # secure enough to allow that.
  grant_types = [
    "authorization_code",
    "refresh_token",
    "implicit",
    "client_credentials",
  ]

  allowed_logout_urls = local.iiif_image_api_config[terraform.workspace].allowed_logout_urls
  callbacks           = local.iiif_image_api_config[terraform.workspace].callbacks
}

resource "auth0_client_grant" "smoke_test" {
  client_id = auth0_client.smoke_test.client_id
  audience  = auth0_resource_server.identity_api.identifier
  scope     = [for scope in auth0_resource_server.identity_api.scopes : scope.value]
}
