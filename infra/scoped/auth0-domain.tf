resource "auth0_custom_domain" "identity" {
  domain = local.auth0_hostname
  type   = "auth0_managed_certs"
}
