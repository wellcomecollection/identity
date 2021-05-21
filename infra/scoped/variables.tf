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
