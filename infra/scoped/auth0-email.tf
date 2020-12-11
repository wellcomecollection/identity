resource "auth0_email" "email" {
  name                 = "smtp"
  enabled              = true
  default_from_address = "${aws_ssm_parameter.auth0_email_from_name.value} <${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}>"

  credentials {
    smtp_host = "email-smtp.eu-west-1.amazonaws.com"
    smtp_port = 587
    smtp_user = aws_iam_access_key.auth0_email.id
    smtp_pass = aws_iam_access_key.auth0_email.ses_smtp_password_v4
  }
}

resource "auth0_email_template" "verify_email" {
  template                = "verify_email"
  enabled                 = true
  from                    = "${aws_ssm_parameter.auth0_email_from_name.value} <${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}>"
  subject                 = "Verify your email address"
  body                    = "ignored"
  syntax                  = "liquid"
  url_lifetime_in_seconds = 432000

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}

resource "auth0_email_template" "reset_email" {
  template                = "reset_email"
  enabled                 = true
  from                    = "${aws_ssm_parameter.auth0_email_from_name.value} <${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}>"
  subject                 = "Reset your password"
  body                    = "ignored"
  syntax                  = "liquid"
  url_lifetime_in_seconds = 432000

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}
