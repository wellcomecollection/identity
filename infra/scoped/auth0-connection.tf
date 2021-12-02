resource "auth0_connection" "sierra" {
  name     = "Sierra-Connection"
  strategy = "auth0"

  enabled_clients = concat([
    auth0_client.api_gateway_identity.id, # Required to allow the Lambda API client credentials to operate on the connection
    auth0_client.account_management_system.id,
    auth0_client.openathens_saml_idp.id,
    auth0_client.smoke_test.id],
    terraform.workspace == "stage" ? local.stage_test_client_ids : [],
  )

  options {
    import_mode                    = false
    enabled_database_customization = true
    disable_signup                 = true
    requires_username              = false
    brute_force_protection         = true
    password_policy                = "fair"

    password_history {
      enable = false
      size   = 5 # Even though we don't use it, this can't be zero - set it to the default value of 5
    }

    password_no_personal_info {
      enable = true
    }

    password_dictionary {
      enable     = true
      dictionary = ["wellcome"]
    }

    password_complexity_options {
      min_length = 8
    }

    custom_scripts = {
      // These create an empty function on the first apply, as they will be managed by
      // the deployment scripts and ignored by TF (see lifecycle block)
      login           = file("${path.module}/data/empty.js"),
      get_user        = file("${path.module}/data/empty.js"),
      change_password = file("${path.module}/data/empty.js"),
      change_email    = file("${path.module}/data/empty.js"),
      verify          = file("${path.module}/data/empty.js"),
      create          = file("${path.module}/data/empty.js"),
      delete          = file("${path.module}/data/empty.js"),
    }

    configuration = {
      API_ROOT      = aws_ssm_parameter.sierra_api_hostname.value,
      CLIENT_KEY    = local.sierra_api_credentials.client_key,
      CLIENT_SECRET = local.sierra_api_credentials.client_secret
    }
  }

  lifecycle {
    ignore_changes = [
      options["scripts"]
    ]
  }
}
