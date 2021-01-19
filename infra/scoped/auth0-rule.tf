resource "auth0_rule_config" "rule_config_sierra_api_root" {
  key   = "API_ROOT"
  value = aws_ssm_parameter.sierra_api_hostname.value
}

resource "auth0_rule_config" "rule_config_sierra_client_key" {
  key   = "CLIENT_KEY"
  value = data.external.sierra_api_credentials.result.SierraAPIKey
}

resource "auth0_rule_config" "rule_config_sierra_client_secret" {
  key   = "CLIENT_SECRET"
  value = data.external.sierra_api_credentials.result.SierraAPISecret
}

resource "auth0_rule" "enrich_patron_attributes" {
  name    = "Enrich-Patron-Attributes"
  script  = file("${path.module}/../../packages/apps/auth0-actions/src/enrich_patron_attributes.js")
  enabled = true

  lifecycle {
    ignore_changes = [
      script
    ]
  }
}
