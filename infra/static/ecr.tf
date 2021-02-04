resource "aws_ecr_repository" "build" {
  name = "uk.ac.wellcome/identity-build"

  tags = merge(
    local.common_tags,
    {
      "Name" = "uk.ac.wellcome/identity-build"
    }
  )
}
