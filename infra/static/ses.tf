resource "aws_ses_domain_identity" "wellcomecollection_org" {
  domain = var.ses_domain
}

resource "aws_ses_domain_dkim" "wellcomecollection_org" {
  domain = var.ses_domain
}
