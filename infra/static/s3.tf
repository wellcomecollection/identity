resource "aws_s3_bucket" "dist" {
  bucket = "identity-dist"
  acl    = "private"

  tags = {
    "Name" = "identity-dist"
  }
}
