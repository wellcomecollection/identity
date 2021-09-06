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

# Azure AD

resource "aws_ssm_parameter" "azure_ad_directory_id" {
  name  = "identity-azure_ad_directory_id-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-azure_ad_directory_id-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "azure_ad_application_id" {
  name  = "identity-azure_ad_application_id-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-azure_ad_application_id-${terraform.workspace}"
  }
}

# Account Management System

resource "aws_ssm_parameter" "account_management_system-auth0_domain" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_domain"
  type     = "String"
  value    = local.auth0_hostname

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_domain"
  }
}

resource "aws_ssm_parameter" "account_management_system-auth0_client_id" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_client_id"
  type     = "String"
  value    = auth0_client.account_management_system.id

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_client_id"
  }
}

resource "aws_ssm_parameter" "account_management_system-auth0_callback_url" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_callback_url"
  type     = "String"
  value    = local.ams_redirect_uri

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_callback_url"
  }
}

resource "aws_ssm_parameter" "account_management_system-api_base_url" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/api_base_url"
  type     = "String"
  value    = local.identity_v1_endpoint

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/api_base_url"
  }
}

resource "aws_ssm_parameter" "account_management_system-context_path" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/context_path"
  type     = "String"
  value    = local.ams_context_path

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/context_path"
  }
}

resource "aws_ssm_parameter" "account_management_system-logout_redirect_url" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/logout_redirect_url"
  type     = "String"
  value    = local.wellcome_collection_site_uri

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_management_system/logout_redirect_url"
  }
}

# Account Admin System

resource "aws_ssm_parameter" "account_admin_system-auth0_domain" {
  name  = "/identity/${terraform.workspace}/account_admin_system/auth0_domain"
  type  = "String"
  value = local.auth0_hostname

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_admin_system/auth0_domain"
  }
}

resource "aws_ssm_parameter" "account_admin_system-auth0_callback_url" {
  name  = "/identity/${terraform.workspace}/account_admin_system/auth0_callback_url"
  type  = "String"
  value = local.aas_redirect_uri

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_admin_system/auth0_callback_url"
  }
}

resource "aws_ssm_parameter" "account_admin_system-api_base_url" {
  name  = "/identity/${terraform.workspace}/account_admin_system/api_base_url"
  type  = "String"
  value = local.identity_v1_endpoint

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_admin_system/api_base_url"
  }
}

resource "aws_ssm_parameter" "account_admin_system-logout_redirect_url" {
  name  = "/identity/${terraform.workspace}/account_admin_system/logout_redirect_url"
  type  = "String"
  value = local.wellcome_collection_site_uri

  tags = {
    "Name" = "/identity/${terraform.workspace}/account_admin_system/logout_redirect_url"
  }
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

resource "aws_ssm_parameter" "email_smtp_hostname" {
  name  = "identity-email_smtp_hostname-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_smtp_hostname-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "email_smtp_port" {
  name  = "identity-email_smtp_port-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_smtp_port-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "email_smtp_username" {
  name  = "identity-email_smtp_username-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_smtp_username-${terraform.workspace}"
  }
}

# Redis - Access Token Cache

resource "aws_ssm_parameter" "redis_access_token_cache_node_type" {
  name  = "identity-redis_access_token_cache_node_type-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-redis_access_token_cache_node_type-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "redis_access_token_cache_number_cache_clusters" {
  name  = "identity-redis_access_token_cache_number_cache_clusters-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_number

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-redis_access_token_cache_number_cache_clusters-${terraform.workspace}"
  }
}

resource "aws_ssm_parameter" "redis_access_token_cache_ttl" {
  name  = "identity-redis_access_token_cache_ttl-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder_string

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-redis_access_token_cache_ttl-${terraform.workspace}"
  }
}
