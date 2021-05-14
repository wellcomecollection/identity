locals {
  requests_container_port = 9001
}

module "requests" {
  source = "../modules/ecs_service"

  service_name            = "requests-${terraform.workspace}"
  deployment_service_name = "requests"

  container_image        = "${local.requests_repository}:env.${terraform.workspace}"
  container_port         = local.requests_container_port
  deployment_service_env = terraform.workspace
  desired_task_count     = 1

  environment = {
    app_port          = local.requests_container_port
    app_base_url      = "???"
    metrics_namespace = "requests"
    context_url       = "???"
    sierra_base_url   = "https://libsys.wellcomelibrary.org/iii/sierra-api"
  }
  secrets = {
    es_host           = "???/es_host"
    es_port           = "???/es_port"
    es_protocol       = "???/es_protocol"
    es_username       = "???/es_username"
    es_password       = "???/es_password"
    sierra_api_key    = "???/sierra_api_key"
    sierra_api_secret = "???/sierra_api_secret"
  }

  load_balancer_arn           = aws_lb.identity_api.arn
  load_balancer_listener_port = local.requests_lb_port

  cluster_arn = aws_ecs_cluster.identity
  vpc_id      = aws_vpc.main.id
  subnets     = local.private_subnets

  security_group_ids = [
    aws_security_group.local.id,
    aws_security_group.egress.id,
    local.elastic_cloud_vpce_sg_id
  ]
}
