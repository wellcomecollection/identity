resource "auth0_tenant" "tenant" {
  friendly_name = "Wellcome Collection Identity"
  support_email = "info@wellcomecollection.org"
  support_url   = "https://wellcomecollection.org/"

  picture_url = "https://${aws_s3_bucket.assets.bucket_regional_domain_name}/${aws_s3_bucket_object.assets_images_wellcomecollections-150x50-png.key}"
}