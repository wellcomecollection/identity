# DNS

data "aws_ssm_parameter" "hostname" {
  name = "identity-hostname"
}

locals {
  external_ssm_parameters = [
    "hostname_prefix",

    # Email
    "email_support_user",
    "email_noreply_user",
    "email_noreply_name",

    # Sierra
    "sierra_api_hostname",

    # Auth0
    "auth0_friendly_name",
    "auth0_universal_login_primary_colour",
    "auth0_universal_login_background_colour",
    "auth0_domain",
    "auth0_support_url",
    "auth0_verify_email_subject",
    "auth0_verify_email_url_ttl",
    "auth0_reset_email_subject",
    "auth0_reset_email_url_ttl",
    "auth0_welcome_email_subject",
    "auth0_blocked_email_subject",
  ]
}

moved {
  from = aws_ssm_parameter.hostname_prefix
  to   = aws_ssm_parameter.external_parameters["hostname_prefix"]
}

moved {
  from = aws_ssm_parameter.email_support_user
  to   = aws_ssm_parameter.external_parameters["email_support_user"]
}

moved {
  from = aws_ssm_parameter.email_noreply_user
  to   = aws_ssm_parameter.external_parameters["email_noreply_user"]
}

moved {
  from = aws_ssm_parameter.email_noreply_name
  to   = aws_ssm_parameter.external_parameters["email_noreply_name"]
}

moved {
  from = aws_ssm_parameter.sierra_api_hostname
  to   = aws_ssm_parameter.external_parameters["sierra_api_hostname"]
}

moved {
  from = aws_ssm_parameter.auth0_friendly_name
  to   = aws_ssm_parameter.external_parameters["auth0_friendly_name"]
}

moved {
  from = aws_ssm_parameter.auth0_universal_login_primary_colour
  to   = aws_ssm_parameter.external_parameters["auth0_universal_login_primary_colour"]
}

moved {
  from = aws_ssm_parameter.auth0_universal_login_background_colour
  to   = aws_ssm_parameter.external_parameters["auth0_universal_login_background_colour"]
}

moved {
  from = aws_ssm_parameter.auth0_domain
  to   = aws_ssm_parameter.external_parameters["auth0_domain"]
}

moved {
  from = aws_ssm_parameter.auth0_support_url
  to   = aws_ssm_parameter.external_parameters["auth0_support_url"]
}

moved {
  from = aws_ssm_parameter.auth0_verify_email_subject
  to   = aws_ssm_parameter.external_parameters["auth0_verify_email_subject"]
}

moved {
  from = aws_ssm_parameter.auth0_verify_email_url_ttl
  to   = aws_ssm_parameter.external_parameters["auth0_verify_email_url_ttl"]
}

moved {
  from = aws_ssm_parameter.auth0_reset_email_subject
  to   = aws_ssm_parameter.external_parameters["auth0_reset_email_subject"]
}

moved {
  from = aws_ssm_parameter.auth0_reset_email_url_ttl
  to   = aws_ssm_parameter.external_parameters["auth0_reset_email_url_ttl"]
}

moved {
  from = aws_ssm_parameter.auth0_welcome_email_subject
  to   = aws_ssm_parameter.external_parameters["auth0_welcome_email_subject"]
}

moved {
  from = aws_ssm_parameter.auth0_blocked_email_subject
  to   = aws_ssm_parameter.external_parameters["auth0_blocked_email_subject"]
}

resource "aws_ssm_parameter" "external_parameters" {
  for_each = toset(local.external_ssm_parameters)

  name  = "identity-${each.key}-${terraform.workspace}"
  value = var.ssm_parameter_placeholder_string
  type  = "String"

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-${each.key}-${terraform.workspace}"
  }
}

locals {
  auth0_domain        = aws_ssm_parameter.external_parameters["auth0_domain"].value
  auth0_support_url   = aws_ssm_parameter.external_parameters["auth0_support_url"].value
  auth0_friendly_name = aws_ssm_parameter.external_parameters["auth0_friendly_name"].value

  auth0_universal_login_primary_colour    = aws_ssm_parameter.external_parameters["auth0_universal_login_primary_colour"].value
  auth0_universal_login_background_colour = aws_ssm_parameter.external_parameters["auth0_universal_login_background_colour"].value

  sierra_api_hostname = aws_ssm_parameter.external_parameters["sierra_api_hostname"].value

  email_support_user = aws_ssm_parameter.external_parameters["email_support_user"].value
  email_noreply_user = aws_ssm_parameter.external_parameters["email_noreply_user"].value
  email_noreply_name = aws_ssm_parameter.external_parameters["email_noreply_name"].value
}

# Email

data "aws_ssm_parameter" "email_domain" {
  name = "identity-email_domain"
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
