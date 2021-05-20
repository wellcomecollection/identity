resource "aws_ecr_repository" "build" {
  name = "uk.ac.wellcome/identity-build"

  tags = {
    "Name" = "uk.ac.wellcome/identity-build"
  }
}
