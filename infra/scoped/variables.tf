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
  auth0_hostname      = "auth.${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"
  auth0_endpoint      = "https://${local.auth0_hostname}"
  auth0_email_address = "${data.aws_ssm_parameter.auth0_email_from_user.value}@${data.aws_ssm_parameter.auth0_email_from_domain.value}"
  auth0_email_from    = "${aws_ssm_parameter.auth0_email_from_name.value} <${local.auth0_email_address}>"

  # Account Management System
  ams_hostname     = "${aws_ssm_parameter.hostname_prefix.value}.${data.aws_ssm_parameter.hostname.value}"
  ams_redirect_uri = "https://${local.ams_hostname}/callback"
  ams_error_uri    = "https://${local.ams_hostname}/error"
  ams_validate_uri = "https://${local.ams_hostname}/validated"
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

# AWS VPC

variable "network_cidr" {
  default = "10.0.0.0/16"
}

variable "network_azs" {
  default = [
    "eu-west-1a",
    "eu-west-1b",
    "eu-west-1c"
  ]
}

variable "network_public_cidrs" {
  default = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24"
  ]
}

variable "network_private_cidrs" {
  default = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"
  ]
}

# Account Management System

variable "ams_image_tag" {
  default = "latest"
}

variable "ams_cpu" {
  default = 256
}

variable "ams_memory" {
  default = 512
}

variable "ams_container_port" {
  default = 3000
}

variable "ams_instance_count" {
  default = 1
}

# Fluent Bit

variable "fluent_bit_image_repo" {
  default = "760097843905.dkr.ecr.eu-west-1.amazonaws.com/uk.ac.wellcome/fluentbit"
}

variable "fluent_bit_image_tag" {
  default = "2ccd2c68f38aa77a8ac1a32fe3ea54bbbd397a38"
}
