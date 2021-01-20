resource "aws_ecr_repository" "build" {
  name = "uk.ac.wellcome/identity-build"

  tags = merge(
    local.common_tags,
    {
      "Name" = "uk.ac.wellcome/identity-build"
    }
  )
}

resource "aws_ecr_repository" "node" {
  name = "uk.ac.wellcome/identity-node"

  tags = merge(
    local.common_tags,
    {
      "Name" = "uk.ac.wellcome/identity-node"
    }
  )
}


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
