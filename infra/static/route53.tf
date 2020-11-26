resource "aws_route53_zone" "account" {
  name = "account.wellcomecollection.org"

  tags = merge(
    local.common_tags,
    {
      "Name" = "account.wellcomecollection.org"
    }
  )
}
