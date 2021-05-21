# DNS

resource "aws_ssm_parameter" "hostname" {
  name  = "identity-hostname"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-hostname"
  }
}

# Auth0

resource "aws_ssm_parameter" "email_domain" {
  name  = "identity-email_domain"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-email_domain"
  }
}

# API Gateway

resource "aws_ssm_parameter" "api_gateway_log_format" {
  name  = "identity-api_gateway_log_format"
  type  = "String"
  value = var.ssm_parameter_placeholder

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    "Name" = "identity-api_gateway_log_format"
  }
}
