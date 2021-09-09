# AWS SES configuration used in production environment

resource "aws_ses_domain_identity" "wellcomecollection_org" {
  domain = aws_ssm_parameter.email_domain.value
}

resource "aws_ses_domain_dkim" "wellcomecollection_org" {
  domain = aws_ssm_parameter.email_domain.value
}

resource "aws_iam_user" "auth0_email" {
  name = "auth0-email"
}

resource "aws_iam_access_key" "auth0_email" {
  user = aws_iam_user.auth0_email.name
}

resource "aws_iam_user_policy" "auth0_email-ses_email_sending_policy" {
  user   = aws_iam_user.auth0_email.name
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ses:SendRawEmail"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

# Mailtrap.io configuration used in stage environment

resource "mailtrap_project" "identity" {
  name = "Identity"
}

resource "mailtrap_inbox" "stage" {
  name       = "Stage"
  project_id = mailtrap_project.identity.id
}

# Create secrets for scoped stack to consume

locals {
  # Mailtrap can use 25 or 465 or 587 or 2525
  # See: https://help.mailtrap.io/article/12-getting-started-guide
  mailtrap_port = "25"

  ses_smtp_hostname = "email-smtp.eu-west-1.amazonaws.com"
  ses_smtp_port     = 587

  mailtrap_email_credentials = {
    smtp_hostname = mailtrap_inbox.stage.smtp_host
    smtp_port     = local.mailtrap_port
    smtp_username = mailtrap_inbox.stage.smtp_username
    smtp_password = mailtrap_inbox.stage.smtp_password
  }

  ses_email_credentials = {
    smtp_hostname = local.ses_smtp_hostname
    smtp_port     = local.ses_smtp_port
    smtp_username = aws_iam_access_key.auth0_email.id
    smtp_password = aws_iam_access_key.auth0_email.ses_smtp_password_v4
  }

  stage_email_secrets_id = "identity/stage/smtp_credentials"
  prod_email_secrets_id  = "identity/prod/smtp_credentials"
}

module "secrets" {
  source = "github.com/wellcomecollection/terraform-aws-secrets?ref=v1.0.0"

  key_value_map = {
    "${local.stage_email_secrets_id}" = jsonencode(local.mailtrap_email_credentials)
    "${local.prod_email_secrets_id}"  = jsonencode(local.ses_email_credentials)
  }
}
