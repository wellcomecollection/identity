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

  error_page {
    html          = ""
    show_log_link = false
    url           = local.ams_error_uri
  }
}
