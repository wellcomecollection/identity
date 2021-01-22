resource "auth0_connection" "sierra" {
  name     = "Sierra-Connection"
  strategy = "auth0"

  enabled_clients = [
    auth0_client.api_gateway_identity.id, # Required to allow the Lambda API client credentials to operate on the connection
    auth0_client.dummy_test.id,
    auth0_client.account_management_system.id
  ]

  options {
    import_mode                    = true
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
      login    = file("${path.module}/../../packages/apps/auth0-actions/src/login.js"),
      get_user = file("${path.module}/../../packages/apps/auth0-actions/src/get_user.js")
    }
  }

  lifecycle {
    ignore_changes = [
      options["custom_scripts"]
    ]
  }
}
