data "aws_route53_zone" "root" {
  provider = aws.dns
  name     = "wellcomecollection.org"
}

# Identity Auth0

locals {
  identity_auth0_verification = flatten([
    for verification in auth0_custom_domain.identity.verification : [
      for method in verification.methods : {
        record = method.record
        type   = upper(method.name)
      }
    ]
  ])
}

resource "aws_route53_record" "identity_auth0" {
  count = length(local.identity_auth0_verification)

  provider = aws.dns
  name     = auth0_custom_domain.identity.domain
  records  = [local.identity_auth0_verification[count.index].record]
  ttl      = 60
  type     = local.identity_auth0_verification[count.index].type
  zone_id  = data.aws_route53_zone.root.id
}

# Identity API

resource "aws_route53_record" "identity_api_v1" {
  provider = aws.dns
  name     = aws_api_gateway_domain_name.identity_v1.domain_name
  type     = "A"
  zone_id  = data.aws_route53_zone.root.id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.identity_v1.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.identity_v1.cloudfront_zone_id
  }
}
