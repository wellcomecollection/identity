# Local

resource "aws_security_group" "local" {
  name   = "identity-local-${terraform.workspace}"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"

    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-local-${terraform.workspace}"
    }
  )
}

# Egress

resource "aws_security_group" "egress" {
  name   = "identity-egress-${terraform.workspace}"
  vpc_id = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-egress-${terraform.workspace}"
    }
  )
}
