resource "aws_ecr_repository" "account_management_system" {
  name = "identity-account-management-system"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-account-management-system"
    }
  )
}

resource "aws_ecr_repository" "account_admin_system" {
  name = "identity-account-admin-system"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-account-admin-system"
    }
  )
}
