# DNS

output "account_zone_name_servers" {
  value = aws_route53_zone.account.name_servers
}

# SES

output "wellcomecollection_org_ses_vertification_token" {
  value = {
    name = "_amazonses.${aws_ses_domain_identity.wellcomecollection_org.id}"
    type = "TXT"
    records = [
    aws_ses_domain_identity.wellcomecollection_org.verification_token]
  }
}

output "wellcomecollection_org_ses_dkim_tokens" {
  value = [
    for token in aws_ses_domain_dkim.wellcomecollection_org.dkim_tokens :
    {
      name = "${token}._domainkey.${var.ses_domain}"
      type = "CNAME"
      records = [
      "${token}.dkim.amazonses.com"]
    }
  ]
}
