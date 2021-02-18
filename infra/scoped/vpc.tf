# VPC

resource "aws_vpc" "main" {
  cidr_block           = var.network_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-vpc-${terraform.workspace}"
    }
  )
}

# Internet Gateway

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-internet-gateway-${terraform.workspace}"
    }
  )
}

# NAT Gateway

resource "aws_eip" "nat_gateway" {
  vpc = true

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-nat-gateway-ip-${terraform.workspace}"
    }
  )
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat_gateway.id
  subnet_id     = aws_subnet.public_1.id

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-nat-gateway-${terraform.workspace}"
    }
  )
}

# Public Routes

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-route-table-${terraform.workspace}"
    }
  )
}

resource "aws_route" "public" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id

  timeouts {
    create = "5m"
  }
}

# Private Routes

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-private-route-table-${terraform.workspace}"
    }
  )
}

resource "aws_route" "private" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main.id
}

# Public Subnets

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_public_cidrs[0]
  availability_zone       = var.network_azs[0]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-subnet-1-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "public_1" {
  route_table_id = aws_route_table.public.id
  subnet_id      = aws_subnet.public_1.id
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_public_cidrs[1]
  availability_zone       = var.network_azs[1]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-subnet-2-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "public_2" {
  route_table_id = aws_route_table.public.id
  subnet_id      = aws_subnet.public_2.id
}

resource "aws_subnet" "public_3" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_public_cidrs[2]
  availability_zone       = var.network_azs[2]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-subnet-3-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "public_3" {
  route_table_id = aws_route_table.public.id
  subnet_id      = aws_subnet.public_3.id
}

# Private Subnets

resource "aws_subnet" "private_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_private_cidrs[0]
  availability_zone       = var.network_azs[0]
  map_public_ip_on_launch = false

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-private-subnet-1-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "private_1" {
  route_table_id = aws_route_table.private.id
  subnet_id      = aws_subnet.private_1.id
}

resource "aws_subnet" "private_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_private_cidrs[1]
  availability_zone       = var.network_azs[1]
  map_public_ip_on_launch = false

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-private-subnet-2-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "private_2" {
  route_table_id = aws_route_table.private.id
  subnet_id      = aws_subnet.private_2.id
}

resource "aws_subnet" "private_3" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.network_private_cidrs[2]
  availability_zone       = var.network_azs[2]
  map_public_ip_on_launch = false

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-private-subnet-3-${terraform.workspace}"
    }
  )
}

resource "aws_route_table_association" "private_3" {
  route_table_id = aws_route_table.private.id
  subnet_id      = aws_subnet.private_3.id
}
