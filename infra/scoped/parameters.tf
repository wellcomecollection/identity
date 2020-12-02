# DNS

data "aws_ssm_parameter" "hostname" {
  name = "identity-hostname"
}

resource "aws_ssm_parameter" "hostname_prefix" {
  name  = "identity-hostname_prefix-${terraform.workspace}"
  type  = "String"
  value = ""

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
  value = ""

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

resource "aws_ssm_parameter" "auth0_domain" {
  name  = "identity-auth0_domain-${terraform.workspace}"
  type  = "String"
  value = ""

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

resource "aws_ssm_parameter" "auth0_email_from_name" {
  name  = "identity-auth0_email_from_name-${terraform.workspace}"
  type  = "String"
  value = ""

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

data "aws_ssm_parameter" "auth0_email_from_domain" {
  name = "identity-auth0_email_from_domain"
}

data "aws_ssm_parameter" "auth0_email_from_user" {
  name = "identity-auth0_email_from_user"
}

# API Gateway

data "aws_ssm_parameter" "api_gateway_log_format" {
  name = "identity-api_gateway_log_format"
}

# Cloudwatch

resource "aws_ssm_parameter" "cloudwatch_retention" {
  name  = "identity-cloudwatch_retention-${terraform.workspace}"
  type  = "String"
  value = ""

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
