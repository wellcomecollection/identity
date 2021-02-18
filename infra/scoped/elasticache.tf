resource "aws_elasticache_subnet_group" "access_token_cache" {
  name = "identity-subnet-group-access-token-cache-${terraform.workspace}"
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
    aws_subnet.private_3.id
  ]
}

resource "aws_elasticache_cluster" "access_token_cache" {
  cluster_id           = "identity-access-token-cache-${terraform.workspace}"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.0.5"
  port                 = 6379

  subnet_group_name = aws_elasticache_subnet_group.access_token_cache.name

  tags = merge(
    local.common_tags,
    {
      "name" = "identity-access-token-cache-${terraform.workspace}"
    }
  )
}
