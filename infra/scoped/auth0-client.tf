resource "auth0_client" "dummy_test" {
  name           = "Dummy Test Client"
  app_type       = "regular_web"
  is_first_party = true
}