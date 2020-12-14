resource "auth0_email" "email" {
  name                 = "smtp"
  enabled              = true
  default_from_address = local.auth0_email_from

  credentials {
    smtp_host = aws_ssm_parameter.smtp_host.value
    smtp_port = 587
    smtp_user = aws_iam_access_key.auth0_email.id
    smtp_pass = aws_iam_access_key.auth0_email.ses_smtp_password_v4
  }
}

resource "auth0_email_template" "verify_email" {
  template                = "verify_email"
  enabled                 = true
  from                    = local.auth0_email_from
  subject                 = aws_ssm_parameter.auth0_verify_email_subject.value
  body                    = var.auth0_email_body_placeholder
  syntax                  = "liquid"
  url_lifetime_in_seconds = aws_ssm_parameter.auth0_verify_email_url_ttl.value

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}

resource "auth0_email_template" "reset_email" {
  template                = "reset_email"
  enabled                 = true
  from                    = local.auth0_email_from
  subject                 = aws_ssm_parameter.auth0_reset_email_subject.value
  body                    = var.auth0_email_body_placeholder
  syntax                  = "liquid"
  url_lifetime_in_seconds = aws_ssm_parameter.auth0_reset_email_url_ttl.value

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}
