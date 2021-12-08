resource "auth0_action" "add_custom_claims" {
  name   = "Add Custom Claims"
  code   = file("${path.module}/data/empty.js")
  deploy = true

  supported_triggers {
    id      = "post-login"
    version = "v2"
  }

  lifecycle {
    ignore_changes = [code]
  }
}

locals {
  // Unfortunately we can't actually make this binding in Terraform yet.
  // It gets done in the deployment script.
  // https://github.com/alexkappa/terraform-provider-auth0/issues/480
  auth0_triggers = {
    post-login = [
      {
        action_name  = auth0_action.add_custom_claims.name,
        display_name = auth0_action.add_custom_claims.name
      }
    ]
  }
}
