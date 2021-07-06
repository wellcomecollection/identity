resource "auth0_rule" "enrich_userinfo" {
  name    = "Enrich-UserInfo"
  script  = file("${path.module}/data/empty.js")
  enabled = true

  lifecycle {
    ignore_changes = [
      script
    ]
  }
}
