# Locals

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }

  # DNS
  auth0_hostname = "${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"
  api_hostname   = "api.${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"

  # API versions
  identity_v1               = "v1"
  identity_v1_hostname      = "v1-${local.api_hostname}"
  identity_v1_docs_hostname = "docs.${local.identity_v1_hostname}"

  # API CORS origins
  identity_v1_origins = "https://${local.identity_v1_docs_hostname}"

  # Email
  auth_email_from = "${aws_ssm_parameter.auth0_email_from_name.value} <${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}>"
}

# Tags

variable "tag_project" {
  default = "Identity"
}

variable "tag_managed_by" {
  default = "Terraform"
}

# SSM Parameters

variable "ssm_parameter_placeholder" {
  default = "unset"
}

# Auth0 Email

variable "auth0_email_body_placeholder" {
  default = "unset"
}

# Auth0 HTML

variable "auth0_html_placeholder" {
  default = "unset"
}
