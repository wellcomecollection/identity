# Identity API

resource "aws_acm_certificate" "identity_api_v1" {
  domain_name       = local.identity_v1_hostname
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  # This certificate attaches to the API Gateway's CloudFront distribution,
  # and a result must be in 'us-east-1'.
  provider = aws.aws_us-east-1

  tags = merge(
    local.common_tags,
    map(
      "name", local.identity_v1_hostname
    )
  )
}

resource "aws_acm_certificate_validation" "identity_api_v1" {
  certificate_arn         = aws_acm_certificate.identity_api_v1.arn
  validation_record_fqdns = [for record in aws_route53_record.identity_api_validation : record.fqdn]

  # This certificate attaches to the API Gateway's CloudFront distribution,
  # and a result must be in 'us-east-1'.
  provider = aws.aws_us-east-1
}
