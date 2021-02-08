resource "auth0_rule" "enrich_userinfo" {
  name    = "Enrich-UserInfo"
  script  = file("${path.module}/../../packages/apps/auth0-actions/src/enrich_userinfo.js")
  enabled = true

  lifecycle {
    ignore_changes = [
      script
    ]
  }
}
