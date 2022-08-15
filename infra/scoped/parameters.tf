# DNS

data "aws_ssm_parameter" "hostname" {
  name = "identity-hostname"
}

resource "aws_ssm_parameter" "hostname_prefix" {
  name  = "identity-hostname_prefix-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-hostname_prefix-${terraform.workspace}"
  }
}

# Email

resource "aws_ssm_parameter" "email_support_user" {
  name  = "identity-email_support_user-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_support_user-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "email_noreply_user" {
  name  = "identity-email_noreply_user-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_noreply_user-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "email_noreply_name" {
  name  = "identity-email_noreply_name-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_noreply_name-${terraform.workspace}"
  }
}

data "aws_ssm_parameter" "email_domain" {
  name = "identity-email_domain"
}

# Sierra

resource "aws_ssm_parameter" "sierra_api_hostname" {
  name  = "identity-sierra_api_hostname-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-sierra_api_hostname-${terraform.workspace}"
  }
}

# Auth0

resource "aws_ssm_parameter" "auth0_friendly_name" {
  name  = "identity-auth0_friendly_name-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_friendly_name-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_universal_login_primary_colour" {
  name  = "identity-auth0_universal_login_primary_colour-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_universal_login_primary_colour-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_universal_login_background_colour" {
  name  = "identity-auth0_universal_login_background_colour-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_universal_login_background_colour-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_domain" {
  name  = "identity-auth0_domain-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_domain-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_support_url" {
  name  = "identity-auth0_support_url-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_support_url-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_verify_email_subject" {
  name  = "identity-auth0_verify_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_verify_email_subject-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_verify_email_url_ttl" {
  name  = "identity-auth0_verify_email_url_ttl-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_number

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_verify_email_url_ttl-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_reset_email_subject" {
  name  = "identity-auth0_reset_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_reset_email_subject-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_reset_email_url_ttl" {
  name  = "identity-auth0_reset_email_url_ttl-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_number

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_reset_email_url_ttl-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_welcome_email_subject" {
  name  = "identity-auth0_welcome_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_welcome_email_subject-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "auth0_blocked_email_subject" {
  name  = "identity-auth0_blocked_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-auth0_blocked_email_subject-${terraform.workspace}"
  }
}

# API Gateway

data "aws_ssm_parameter" "api_gateway_log_format" {
  name = "identity-api_gateway_log_format"
}

# Cloudwatch

resource "aws_ssm_parameter" "cloudwatch_retention" {
  name  = "identity-cloudwatch_retention-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_number

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-cloudwatch_retention-${terraform.workspace}"
  }
}

# Account Management System / identity web app

locals {
  ssm_parameters = {
    auth0_domain        = local.auth0_hostname
    auth0_client_id     = auth0_client.identity_web_app.id
    auth0_callback_url  = local.ams_redirect_uri
    api_base_url        = local.identity_v1_endpoint
    context_path        = local.ams_context_path
    logout_redirect_url = local.wellcome_collection_site_uri
  }
}

moved {
  from = aws_ssm_parameter.account_management_system-auth0_domain
  to   = aws_ssm_parameter.account_management_system["auth0_domain"]
}

moved {
  from = aws_ssm_parameter.account_management_system-auth0_client_id
  to   = aws_ssm_parameter.account_management_system["auth0_client_id"]
}

moved {
  from = aws_ssm_parameter.account_management_system-auth0_callback_url
  to   = aws_ssm_parameter.account_management_system["auth0_callback_url"]
}

moved {
  from = aws_ssm_parameter.account_management_system-api_base_url
  to   = aws_ssm_parameter.account_management_system["api_base_url"]
}

moved {
  from = aws_ssm_parameter.account_management_system-context_path
  to   = aws_ssm_parameter.account_management_system["context_path"]
}

moved {
  from = aws_ssm_parameter.account_management_system-logout_redirect_url
  to   = aws_ssm_parameter.account_management_system["logout_redirect_url"]
}

resource "aws_ssm_parameter" "account_management_system" {
  for_each = local.ssm_parameters

  name  = "/identity/${terraform.workspace}/account_management_system/${each.key}"
  value = each.value
  type  = "String"

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/${each.key}"
  }

  provider = aws.experience
}

# Email

resource "aws_ssm_parameter" "email_admin_address" {
  name  = "identity-email_admin_address-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_admin_address-${terraform.workspace}"
  }
}
