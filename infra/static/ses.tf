resource "aws_ses_domain_identity" "wellcomecollection_org" {
  domain = aws_ssm_parameter.ses_domain.value
}

resource "aws_ses_domain_dkim" "wellcomecollection_org" {
  domain = aws_ssm_parameter.ses_domain.value
}
