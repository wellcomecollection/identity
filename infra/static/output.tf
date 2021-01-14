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
      aws_ses_domain_identity.wellcomecollection_org.verification_token
    ]
  }
}

output "wellcomecollection_org_ses_dkim_tokens" {
  value = [
    for token in aws_ses_domain_dkim.wellcomecollection_org.dkim_tokens :
    {
      name = "${token}._domainkey.${aws_ssm_parameter.ses_domain.value}"
      type = "CNAME"
      records = [
        "${token}.dkim.amazonses.com"
      ]
    }
  ]
}

# ECR

output "repository_account_management_system" {
  value = "https://${aws_ecr_repository.account_management_system.repository_url}"
}

output "repository_account_admin_system" {
  value = "https://${aws_ecr_repository.account_admin_system.repository_url}"
}
