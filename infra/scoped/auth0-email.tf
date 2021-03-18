resource "auth0_email" "email" {
  name                 = "smtp"
  enabled              = true
  default_from_address = local.email_noreply_name_and_address

  credentials {
    smtp_host = aws_ssm_parameter.email_smtp_hostname.value
    smtp_port = 587
    smtp_user = aws_ssm_parameter.email_smtp_username.value
    smtp_pass = data.aws_secretsmanager_secret_version.email_smtp_password_secret_version.secret_string
  }
}

resource "auth0_email_template" "verify_email" {
  template                = "verify_email"
  enabled                 = true
  from                    = local.email_noreply_name_and_address
  subject                 = aws_ssm_parameter.auth0_verify_email_subject.value
  body                    = var.auth0_email_body_placeholder
  syntax                  = "liquid"
  url_lifetime_in_seconds = aws_ssm_parameter.auth0_verify_email_url_ttl.value
  result_url              = local.ams_validate_uri

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}

resource "auth0_email_template" "reset_email" {
  template                = "reset_email"
  enabled                 = true
  from                    = local.email_noreply_name_and_address
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

resource "auth0_email_template" "welcome_email" {
  template = "welcome_email"
  enabled  = true
  from     = local.email_noreply_name_and_address
  subject  = aws_ssm_parameter.auth0_welcome_email_subject.value
  body     = var.auth0_email_body_placeholder
  syntax   = "liquid"

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}
