resource "auth0_connection" "sierra" {
  name     = "Sierra-Connection"
  strategy = "auth0"

  enabled_clients = [
    auth0_client.dummy_test.id
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
  }
}
