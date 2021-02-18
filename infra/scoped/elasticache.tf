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
  node_type             = aws_ssm_parameter.redis_access_token_cache_node_type.value
  number_cache_clusters = aws_ssm_parameter.redis_access_token_cache_number_cache_clusters.value
  port                  = 6379

  subnet_group_name = aws_elasticache_subnet_group.access_token_cache.name
  security_group_ids = [
    aws_security_group.local.id,
    aws_security_group.egress.id
  ]

  lifecycle {
    ignore_changes = [
      # We have to specify '6.x' above, but after creation this will change to a specific version and breaks when
      # `apply'ing.
      engine_version
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "name" = "identity-access-token-cache-${terraform.workspace}"
    }
  )
}
