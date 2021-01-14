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

# Load Balancer

resource "aws_security_group" "load_balancer" {
  name   = "identity-load-balancer-${terraform.workspace}"
  vpc_id = aws_vpc.main.id

  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80

    cidr_blocks = split(",", aws_ssm_parameter.network_http_whitelist.value)
  }

  ingress {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443

    cidr_blocks = split(",", aws_ssm_parameter.network_http_whitelist.value)
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-load-balancer-${terraform.workspace}"
    }
  )
}
