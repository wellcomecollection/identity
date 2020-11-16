# Locals

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }

  # API versions
  identity_v1          = "v1"
  identity_v1_hostname = "v1-${var.api_hostname}"
}

# Tags

variable "tag_project" {
  default = "Identity"
}

variable "tag_managed_by" {
  default = "Terraform"
}

# DNS

variable "api_hostname" {}
