resource "auth0_rule" "enrich_userinfo" {
  name = "Enrich-UserInfo"
  // This creates an empty function on the first apply, as it will be managed by
  // the deployment scripts and ignored by TF (see lifecycle block)
  script  = file("${path.module}/data/empty.js")
  enabled = true

  lifecycle {
    ignore_changes = [
      script
    ]
  }
}
