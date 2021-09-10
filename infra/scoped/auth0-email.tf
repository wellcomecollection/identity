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

resource "auth0_email_template" "verify_email" {
  template                = "verify_email"
  enabled                 = true
  from                    = local.email_noreply_name_and_address
  subject                 = aws_ssm_parameter.auth0_verify_email_subject.value
  body                    = var.auth0_email_body_placeholder
  syntax                  = "liquid"
  url_lifetime_in_seconds = aws_ssm_parameter.auth0_verify_email_url_ttl.value
  result_url              = local.ams_validate_uri

  depends_on = [
    auth0_email.email
  ]

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

  depends_on = [
    auth0_email.email
  ]

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

  depends_on = [
    auth0_email.email
  ]

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}

resource "auth0_email_template" "blocked_email" {
  template = "blocked_account"
  enabled  = true
  from     = local.email_noreply_name_and_address
  subject  = aws_ssm_parameter.auth0_blocked_email_subject.value
  body     = var.auth0_email_body_placeholder
  syntax   = "liquid"

  depends_on = [
    auth0_email.email
  ]

  lifecycle {
    ignore_changes = [
      body
    ]
  }
}
