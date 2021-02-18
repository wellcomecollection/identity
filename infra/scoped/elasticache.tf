resource "aws_elasticache_subnet_group" "access_token_cache" {
  name = "identity-subnet-group-access-token-cache-${terraform.workspace}"
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
    aws_subnet.private_3.id
  ]
}

resource "aws_elasticache_replication_group" "access_token_cache" {
  replication_group_id          = "identity-access-token-cache-${terraform.workspace}"
  replication_group_description = "identity-access-token-cache-${terraform.workspace}"

  automatic_failover_enabled = true

  engine                = "redis"
  engine_version        = "6.x"
  parameter_group_name  = "default.redis6.x"
  node_type             = "cache.t2.micro"
  number_cache_clusters = 2
  port                  = 6379

  subnet_group_name = aws_elasticache_subnet_group.access_token_cache.name
  security_group_ids = [
    aws_security_group.local.id,
    aws_security_group.egress.id
  ]

  lifecycle {
    ignore_changes = [
      engine_version # We have to specify '6.x' above, but after creation this will change to a specific version
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "name" = "identity-access-token-cache-${terraform.workspace}"
    }
  )
}
