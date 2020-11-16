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
    password_policy                = "excellent"

    password_history {
      enable = true
      size   = 24
    }

    password_no_personal_info {
      enable = true
    }

    password_dictionary {
      enable = true
    }

    password_complexity_options {
      min_length = 12
    }
  }
}