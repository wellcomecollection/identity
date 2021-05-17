# Provider config

variable "provider_role_arn" {
  type    = string
  default = "arn:aws:iam::770700576653:role/identity-developer"
}

# Tags

variable "tag_project" {
  default = "Identity"
}

variable "tag_managed_by" {
  default = "Terraform"
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

# SSM Parameters

variable "ssm_parameter_placeholder_string" {
  default = "unset"
}

variable "ssm_parameter_placeholder_number" {
  default = 0
}

# Auth0 Email

variable "auth0_email_body_placeholder" {
  default = "unset"
}

# Auth0 HTML

variable "auth0_html_placeholder" {
  default = "unset"
}
