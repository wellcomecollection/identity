resource "aws_s3_bucket" "dist" {
  bucket = "identity-dist"
  acl    = "private"

  tags = {
    "Name" = "identity-dist"
  }

  lifecycle_rule {
    id      = "expire_old_builds"
    enabled = true

    expiration {
      days = 7
    }
  }
}
