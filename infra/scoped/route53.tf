data "aws_route53_zone" "identity" {
  name = "identity.wellcomecollection.org"
}

# Identity API

resource "aws_route53_record" "identity_api" {
  name    = aws_api_gateway_domain_name.identity_v1.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.identity.id

  alias {
    evaluate_target_health = true
    name                   = aws_api_gateway_domain_name.identity_v1.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.identity_v1.cloudfront_zone_id
  }
}

resource "aws_route53_record" "identity_api_validation" {
  for_each = {
    for dvo in aws_acm_certificate.identity_api_v1.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.identity.zone_id
}
