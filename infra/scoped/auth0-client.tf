resource "auth0_client" "dummy_test" {
  name           = "Dummy Test Client"
  app_type       = "regular_web"
  is_first_party = true

  custom_login_page_on = false

  callbacks = [
    "https://${local.auth0_hostname}/login/callback"
  ]
}

resource "auth0_client" "buildkite" {
  name     = "Buildkite"
  app_type = "non_interactive"

  custom_login_page_on = false
}

resource "auth0_client_grant" "buildkite" {
  client_id = auth0_client.buildkite.id
  audience  = "https://${var.auth0_domain}/api/v2/"
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
    "update:branding"
  ]
}
