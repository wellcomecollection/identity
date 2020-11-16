resource "aws_route53_zone" "identity" {
  name = "identity.wellecomecollection.org"

  tags = merge(
    local.common_tags,
    map(
      "name", "identity.wellecomecollection.org"
    )
  )
}
