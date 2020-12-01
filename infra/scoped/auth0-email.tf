resource "auth0_email" "email" {
  name                 = "ses"
  enabled              = true
  default_from_address = "${aws_ssm_parameter.auth0_email_from_name.value} <${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}>"

  credentials {
    access_key_id     = aws_iam_access_key.auth0_email.id
    secret_access_key = aws_iam_access_key.auth0_email.secret
    region            = "eu-west-1"
  }
}
