# Locals

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }

  # API Gateway
  api_hostname = "api.${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"

  # API Gateway V1
  identity_v1               = "v1"
  identity_v1_hostname      = "v1-${local.api_hostname}"
  identity_v1_endpoint      = "https://${local.identity_v1_hostname}"
  identity_v1_docs_hostname = "docs.${local.identity_v1_hostname}"
  identity_v1_docs_endpoint = "https://${local.identity_v1_docs_hostname}"

  # Auth0
  auth0_hostname      = "${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"
  auth0_endpoint      = "https://${local.auth0_hostname}"
  auth0_email_address = "${aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}"
  auth0_email_from    = "${aws_ssm_parameter.auth0_email_from_name.value} <${local.auth0_email_address}>"

  # Account Management System
  ams_hostnames = {
    stage = "www-stage.wellcomecollection.org",
    prod  = "wellcomecollection.org"
  }
  ams_context_path = "account"
  ams_redirect_uri = "https://${local.ams_hostnames[terraform.workspace]}/${local.ams_context_path}/callback"
  ams_error_uri    = "https://${local.ams_hostnames[terraform.workspace]}/${local.ams_context_path}/error"
  ams_validate_uri = "https://${local.ams_hostnames[terraform.workspace]}/${local.ams_context_path}/validated"
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
