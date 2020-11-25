resource "auth0_email" "email" {
  name                 = "ses"
  enabled              = true
  default_from_address = "${var.auth0_email_from_name} <${var.auth0_email_from_user}@${var.auth0_email_from_domain}>"

  credentials {
    access_key_id     = aws_iam_access_key.auth0_email.id
    secret_access_key = aws_iam_access_key.auth0_email.secret
    region            = "eu-west-1"
  }
}
