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

    configuration = {
      API_ROOT      = aws_ssm_parameter.sierra_api_hostname.value,
      CLIENT_KEY    = data.external.sierra_api_credentials.result.SierraAPIKey,
      CLIENT_SECRET = data.external.sierra_api_credentials.result.SierraAPISecret
    }
  }

  lifecycle {
    ignore_changes = [
      options["custom_scripts"]
    ]
  }
}

resource "auth0_connection" "azure_ad" {

  name     = "AzureAD-Connection"
  strategy = "oauth2"

  enabled_clients = [
    auth0_client.dummy_test.id,
    auth0_client.account_admin_system.id
  ]

  options {
    authorization_endpoint = "https://login.microsoftonline.com/${aws_ssm_parameter.azure_ad_directory_id.value}/oauth2/v2.0/authorize"
    token_endpoint         = "https://login.microsoftonline.com/${aws_ssm_parameter.azure_ad_directory_id.value}/oauth2/v2.0/token"

    client_id     = aws_ssm_parameter.azure_ad_application_id.value
    client_secret = data.aws_secretsmanager_secret_version.azure_ad_client_secret_version.secret_string

    scopes = [
      "User.Read"
    ]

    scripts = {
      fetchUserProfile = file("${path.module}/../../packages/apps/auth0-actions/src/create_azure_ad_profile.js")
    }
  }

  lifecycle {
    ignore_changes = [
      options["scripts"]
    ]
  }
}
