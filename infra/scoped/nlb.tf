resource "aws_lb" "identity_api" {
  name               = "identity-api-${terraform.workspace}"
  internal           = true
  load_balancer_type = "network"
  subnets            = local.routable_private_subnets
}
