resource "auth0_tenant" "tenant" {
  friendly_name = "${local.auth0_friendly_name}${local.environment_qualifier}"
  picture_url   = "https://${aws_s3_bucket.assets.bucket_regional_domain_name}/${aws_s3_bucket_object.assets_images_wellcomecollections-150x50-png.key}"
  support_email = local.email_support_address
  support_url   = local.auth0_support_url

  # This is required for the 'password' grant type that is used when testing user credentials
  default_directory = auth0_connection.sierra.name

  idle_session_lifetime = local.session_rolling_lifetime_hours
  session_lifetime      = local.session_absolute_lifetime_hours

  flags {
    enable_custom_domain_in_emails = true
    universal_login                = true # Enables the 'new' Universal Login experience
  }

  universal_login {
    colors {
      primary         = local.auth0_universal_login_primary_colour
      page_background = local.auth0_universal_login_background_colour
    }
  }

  # The auth-deploy-cli tool queries the Auth0 Management API to fetch the current HTML customisations for the three
  # pages supported by the Legacy Experience. It queries the API and gets JSON response, and then uses the names of the
  # three pages (which are hardcoded in the tool) to look up the objects in the JSON. The code appears to assume that,
  # if the key is present in the JSON, then the corresponding HTML must be there too inside the object. That isn't the
  # case, and in fact if you've never toggled the customisations on / off, they appear as empty objects {}. The tool
  # can't handle this and errors out.

  change_password {
    enabled = false
    html    = "unset"
  }

  guardian_mfa_page {
    enabled = false
    html    = "unset"
  }

  error_page {
    html          = "unset"
    show_log_link = false
    url           = local.front_end_error_uri
  }
}
