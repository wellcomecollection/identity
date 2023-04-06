resource "auth0_tenant" "tenant" {
  friendly_name = "${local.auth0_friendly_name}${local.environment_qualifier}"
  picture_url   = "https://${aws_s3_bucket.assets.bucket_regional_domain_name}/${aws_s3_object.assets_images_wellcomecollections-150x50-png.key}"
  support_email = local.email_support_address
  support_url   = local.auth0_support_url

  # This is required for the 'password' grant type that is used when testing user credentials
  default_directory = auth0_connection.sierra.name

  idle_session_lifetime = local.session_rolling_lifetime_hours
  session_lifetime      = local.session_absolute_lifetime_hours

  flags {
    enable_custom_domain_in_emails = true
    universal_login                = true # Enables the 'new' Universal Login experience

    # This is the Auth0 dashboard setting "Use a generic response in public
    # signup API error message"
    #
    # If somebody tries to sign up with an existing email address:
    #
    #     Before: Something went wrong, please try again later
    #     After:  The user already exists.
    #
    # Auth0 disables this by default, to prevent attackers deducing the
    # existence of an account by trying to sign up with the email address.
    # This is a sensible default, because some of their customers are in areas
    # where merely revealing the existence of a user account is a risk,
    # e.g. anything financial or medical-related.
    #
    # For us, we prefer convenience over security: knowing that somebody
    # has a library account isn't especially sensitive, and the more specific
    # error message means users can reset their existing account password
    # without emailing the library first.
    enable_public_signup_user_exists_error = true
  }

  universal_login {
    colors {
      primary         = "#4f7d68" // accent.green
      page_background = "#d9d8d0" // warmNeutral.400
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
