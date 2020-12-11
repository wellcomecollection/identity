resource "auth0_tenant" "tenant" {
  friendly_name = "Wellcome Collection Identity"
  support_email = "info@wellcomecollection.org"
  support_url   = "https://wellcomecollection.org/"

  picture_url = "https://${aws_s3_bucket.assets.bucket_regional_domain_name}/${aws_s3_bucket_object.assets_images_wellcomecollections-150x50-png.key}"

  universal_login {
    colors {
      primary         = "#007868"
      page_background = "#F0EDE3"
    }
  }

  change_password {
    enabled = true
    html    = var.auth0_html_placeholder
  }

  lifecycle {
    ignore_changes = [
      change_password.0.html
    ]
  }
}
