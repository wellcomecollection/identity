# Locals

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }

  # DNS
  auth0_hostname = "${var.hostname_prefix}.${var.hostname}"
  api_hostname   = "api.${var.hostname_prefix}.${var.hostname}"

  # API versions
  identity_v1          = "v1"
  identity_v1_hostname = "v1-${local.api_hostname}"
}

# Tags

variable "tag_project" {
  default = "Identity"
}

variable "tag_managed_by" {
  default = "Terraform"
}

# DNS

variable "hostname" {
  # Assume that this hostname is available as a Route 53 zone within the same AWS account
  default = "identity.wellcomecollection.org"
}

variable "hostname_prefix" {}

# Auth0

variable "auth0_domain" {}

# Cloudwatch

variable cloudwatch_retention {}

# API Gateway

variable "api_gateway_log_format" {
  default = "$context.identity.sourceIp $context.identity.caller  $context.identity.user [$context.requestTime] $context.httpMethod $context.resourcePath $context.protocol $context.status $context.responseLength $context.requestId"
}
