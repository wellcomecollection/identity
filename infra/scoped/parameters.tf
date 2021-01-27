# DNS

data "aws_ssm_parameter" "hostname" {
  name = "identity-hostname"
}

resource "aws_ssm_parameter" "hostname_prefix" {
  name  = "identity-hostname_prefix-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-hostname_prefix-${terraform.workspace}"
    }
  )
}

# Sierra

resource "aws_ssm_parameter" "sierra_api_hostname" {
  name  = "identity-sierra_api_hostname-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-sierra_api_hostname-${terraform.workspace}"
    }
  )
}

# Auth0

resource "aws_ssm_parameter" "auth0_friendly_name" {
  name  = "identity-auth0_friendly_name-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_friendly_name-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_universal_login_primary_colour" {
  name  = "identity-auth0_universal_login_primary_colour-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_universal_login_primary_colour-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_universal_login_background_colour" {
  name  = "identity-auth0_universal_login_background_colour-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_universal_login_background_colour-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_domain" {
  name  = "identity-auth0_domain-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_domain-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_support_url" {
  name  = "identity-auth0_support_url-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_support_url-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_email_from_name" {
  name  = "identity-auth0_email_from_name-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_email_from_name-${terraform.workspace}"
    }
  )
}

data "aws_ssm_parameter" "auth0_email_from_user" {
  name = "identity-auth0_email_from_user"
}

data "aws_ssm_parameter" "auth0_email_from_domain" {
  name = "identity-auth0_email_from_domain"
}

resource "aws_ssm_parameter" "auth0_verify_email_subject" {
  name  = "identity-auth0_verify_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_verify_email_subject-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_verify_email_url_ttl" {
  name  = "identity-auth0_verify_email_url_ttl-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_verify_email_url_ttl-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_reset_email_subject" {
  name  = "identity-auth0_reset_email_subject-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_reset_email_subject-${terraform.workspace}"
    }
  )
}

resource "aws_ssm_parameter" "auth0_reset_email_url_ttl" {
  name  = "identity-auth0_reset_email_url_ttl-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_reset_email_url_ttl-${terraform.workspace}"
    }
  )
}

# API Gateway

data "aws_ssm_parameter" "api_gateway_log_format" {
  name = "identity-api_gateway_log_format"
}

# Cloudwatch

resource "aws_ssm_parameter" "cloudwatch_retention" {
  name  = "identity-cloudwatch_retention-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-cloudwatch_retention-${terraform.workspace}"
    }
  )
}

# SMTP

resource "aws_ssm_parameter" "smtp_host" {
  name  = "identity-smtp_host-${terraform.workspace}"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-smtp_host-${terraform.workspace}"
    }
  )
}

# Account Management System

resource "aws_ssm_parameter" "account_management_system-auth0_domain" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_domain"
  type     = "String"
  value    = local.auth0_hostname

  tags = merge(
    local.common_tags,
    {
      "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_domain"
    }
  )
}

resource "aws_ssm_parameter" "account_management_system-auth0_client_id" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_client_id"
  type     = "String"
  value    = auth0_client.account_management_system.id

  tags = merge(
    local.common_tags,
    {
      "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_client_id"
    }
  )
}

resource "aws_ssm_parameter" "account_management_system-auth0_callback_url" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/auth0_callback_url"
  type     = "String"
  value    = local.ams_redirect_uri

  tags = merge(
    local.common_tags,
    {
      "Name" = "/identity/${terraform.workspace}/account_management_system/auth0_callback_url"
    }
  )
}

resource "aws_ssm_parameter" "account_management_system-api_base_url" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/api_base_url"
  type     = "String"
  value    = local.identity_v1_endpoint

  tags = merge(
    local.common_tags,
    {
      "Name" = "/identity/${terraform.workspace}/account_management_system/api_base_url"
    }
  )
}

resource "aws_ssm_parameter" "account_management_system-context_path" {
  provider = aws.experience
  name     = "/identity/${terraform.workspace}/account_management_system/context_path"
  type     = "String"
  value    = local.ams_context_path

  tags = merge(
    local.common_tags,
    {
      "Name" = "/identity/${terraform.workspace}/account_management_system/context_path"
    }
  )
}
