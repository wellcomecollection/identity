resource "auth0_tenant" "tenant" {
  friendly_name = aws_ssm_parameter.auth0_friendly_name.value
  picture_url   = "https://${aws_s3_bucket.assets.bucket_regional_domain_name}/${aws_s3_bucket_object.assets_images_wellcomecollections-150x50-png.key}"
  support_email = local.auth0_email_address
  support_url   = aws_ssm_parameter.auth0_support_url.value

  flags {
    enable_custom_domain_in_emails = true
    universal_login                = true # Enables the 'new' Universal Login experience
  }

  universal_login {
    colors {
      primary         = aws_ssm_parameter.auth0_universal_login_primary_colour.value
      page_background = aws_ssm_parameter.auth0_universal_login_background_colour.value
    }
  }

  # The custom "Change Password" UI is enabled on the tenant level, because when the user enters into the change
  # password flow they are doing so independently of an application (in other words, Auth0 applications are not involved
  # in the Auth0 change password flow). On the other hand, the login screen are application aware and thus can be
  # enabled and configured on a per-application basis.
  change_password {
    enabled = true
    html    = var.auth0_html_placeholder
  }

  error_page {
    html          = ""
    show_log_link = false
    url           = local.ams_error_uri
  }

  lifecycle {
    ignore_changes = [
      change_password.0.html
    ]
  }
}
