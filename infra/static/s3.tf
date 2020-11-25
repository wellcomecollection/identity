resource "aws_s3_bucket" "dist" {
  bucket = "identity-dist"
  acl    = "private"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-dist"
    }
  )
}
