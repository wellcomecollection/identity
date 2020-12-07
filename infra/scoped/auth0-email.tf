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
