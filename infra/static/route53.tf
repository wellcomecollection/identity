resource "aws_route53_zone" "identity" {
  name = "identity.wellcomecollection.org"

  tags = merge(
    local.common_tags,
    map(
      "name", "identity.wellcomecollection.org"
    )
  )
}
