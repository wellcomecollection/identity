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
