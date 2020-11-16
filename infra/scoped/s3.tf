resource "aws_s3_bucket" "assets" {
  bucket = "identity-public-assets-${terraform.workspace}"
  acl    = "private"

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-public-assets-${terraform.workspace}"
    )
  )
}

resource "aws_s3_bucket_object" "assets_images_wellcomecollections-150x50-png" {
  bucket = aws_s3_bucket.assets.bucket
  key    = "images/wellcomecollections-150x50.png"
  source = "${path.module}/assets/images/wellcomecollections-150x50.png"
  etag   = filemd5("${path.module}/assets/images/wellcomecollections-150x50.png")
  acl    = "public-read"

  tags = merge(
    local.common_tags,
    map(
      "name", "images/wellcomecollections-150x50.png"
    )
  )
}
