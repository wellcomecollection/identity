# DNS

resource "aws_ssm_parameter" "hostname" {
  name  = "identity-hostname"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-hostname"
    }
  )
}

# Auth0

resource "aws_ssm_parameter" "auth0_email_from_domain" {
  name  = "identity-auth0_email_from_domain"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-auth0_email_from_domain"
    }
  )
}

# API Gateway

resource "aws_ssm_parameter" "api_gateway_log_format" {
  name  = "identity-api_gateway_log_format"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-api_gateway_log_format"
    }
  )
}

# AWS SES

resource "aws_ssm_parameter" "ses_domain" {
  name  = "identity-ses_domain"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-ses_domain"
    }
  )
}
