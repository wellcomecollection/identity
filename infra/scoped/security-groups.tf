# Local

data "aws_vpc" "identity" {
  id = local.vpc_id
}

resource "aws_security_group" "local" {
  name   = "identity-local-${terraform.workspace}"
  vpc_id = local.vpc_id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [data.aws_vpc.identity.cidr_block]
  }

  tags = {
    "Name" = "identity-local-${terraform.workspace}"
  }
}

# Egress

resource "aws_security_group" "egress" {
  name   = "identity-egress-${terraform.workspace}"
  vpc_id = local.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    "Name" = "identity-egress-${terraform.workspace}"
  }
}
