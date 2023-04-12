module "cert" {
  source = "github.com/wellcomecollection/terraform-aws-acm-certificate?ref=v1.0.0"

  domain_name = local.identity_v1_hostname

  zone_id = data.aws_route53_zone.root.id

  providers = {
    aws     = aws.aws_us-east-1
    aws.dns = aws.dns
  }
}

data "aws_route53_zone" "zone" {
  provider = aws.dns

  name = "wellcomecollection.org."
}
