resource "aws_ecs_cluster" "identity" {
  name = "identity-${terraform.workspace}"
}
