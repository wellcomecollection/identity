# Tags

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }
}

variable "tag_project" {
  default = "Identity"
}

variable "tag_managed_by" {
  default = "Terraform"
}
