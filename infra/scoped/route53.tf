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

resource "aws_route53_record" "identity_api_v1_validation" {
  for_each = {
    for dvo in aws_acm_certificate.identity_api_v1.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  provider        = aws.dns
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root.zone_id
}

# S3 Swagger UI

resource "aws_route53_record" "swagger_ui_v1" {
  provider = aws.dns
  name     = local.identity_v1_docs_hostname
  type     = "A"
  zone_id  = data.aws_route53_zone.root.id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.swagger_ui_v1.domain_name
    zone_id                = aws_cloudfront_distribution.swagger_ui_v1.hosted_zone_id
  }
}

resource "aws_route53_record" "swagger_ui_v1_validation" {
  for_each = {
    for dvo in aws_acm_certificate.swagger_ui_v1.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  provider        = aws.dns
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root.zone_id
}
