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

resource "auth0_action" "redirect_to_full_registration" {
  name   = "Redirect to full registration"
  code   = file("${path.module}/data/empty.js")
  deploy = true

  supported_triggers {
    id      = "post-login"
    version = "v2"
  }

  lifecycle {
    ignore_changes = [code]
  }

  # We saw issues in the initial development of the registration feature
  # where users were redirected to http://localhost:3000 rather than the
  # actual site.
  #
  # We think this was caused by a bad value in `IDENTITY_APP_BASEURL`,
  # because Terraform doesn't update secrets in an already-extant action.
  # In particular, if you delete or modify the secret in the Auth0 console,
  # Terraform won't try to revert the value of the secret.
  #
  # To fix this, we used the Auth0 console to updated the value of the secret:
  #
  #     IDENTITY_APP_BASEURL = https://www-stage.wellcomecollection.org/account
  #
  # Ideally this would be fully managed by Terraform, but we didn't have
  # time to debug this properly.
  secrets {
    name  = "IDENTITY_APP_BASEURL"
    value = local.ams_registration_uri
  }

  secrets {
    name  = "AUTH0_PAYLOAD_SECRET"
    value = data.aws_secretsmanager_secret_version.redirect_action_secret.secret_string
  }
}

resource "auth0_trigger_binding" "post_login" {
  trigger = "post-login"

  actions {
    id           = auth0_action.add_custom_claims.id
    display_name = auth0_action.add_custom_claims.name
  }

  actions {
    id           = auth0_action.redirect_to_full_registration.id
    display_name = auth0_action.redirect_to_full_registration.name
  }
}
