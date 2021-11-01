resource "auth0_email" "email" {
  name                 = "smtp"
  enabled              = true
  default_from_address = local.email_noreply_name_and_address

  credentials {
    smtp_host = local.email_credentials["smtp_hostname"]
    smtp_port = 587
    smtp_user = local.email_credentials["smtp_username"]
    smtp_pass = local.email_credentials["smtp_password"]
  }
}
