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
      name = "${token}._domainkey.${aws_ssm_parameter.email_domain.value}"
      type = "CNAME"
      records = [
        "${token}.dkim.amazonses.com"
      ]
    }
  ]
}

output "ses_smtp_hostname" {
  value = "email-smtp.eu-west-1.amazonaws.com"
}

output "ses_smtp_port" {
  value = 587
}

# ECR

output "repository_build" {
  value = "https://${aws_ecr_repository.build.repository_url}"
}
