locals {
  requests_container_port = 9001

  n_private_subnets        = length(local.private_subnets)
  desired_task_count       = terraform.workspace == "prod" ? 3 : 1
  clamped_n_subnets        = min(local.n_private_subnets, local.desired_task_count)
  routable_private_subnets = slice(local.private_subnets, 0, local.clamped_n_subnets)

  apm_secret_config = {
    apm_server_url = "identity/api/apm_server_url"
    apm_secret     = "identity/api/apm_secret"
  }
}

module "requests" {
  source = "../modules/ecs_service"

  service_name            = "requests-${terraform.workspace}"
  deployment_service_name = "requests"

  container_image        = "${local.requests_repository}:env.${terraform.workspace}"
  container_port         = local.requests_container_port
  deployment_service_env = terraform.workspace
  desired_task_count     = local.desired_task_count

  app_cpu    = 1024
  app_memory = 2048

  environment = {
    app_port          = local.requests_container_port
    metrics_namespace = "requests"
    app_base_url      = local.identity_v1_endpoint
    sierra_base_url   = "https://libsys.wellcomelibrary.org/iii/sierra-api"
    apm_service_name  = "requests-api"
    apm_environment   = terraform.workspace
    user_hold_limit   = local.per_user_hold_limit

    catalogue_api_public_root = local.catalogue_api_public_root
  }
  secrets = merge(local.apm_secret_config, {
    sierra_api_key    = "sierra-api-credentials-${terraform.workspace}:SierraAPIKey"
    sierra_api_secret = "sierra-api-credentials-${terraform.workspace}:SierraAPISecret"
  })

  load_balancer_arn           = aws_lb.identity_api.arn
  load_balancer_listener_port = local.requests_lb_port

  cluster_arn = aws_ecs_cluster.identity.arn
  vpc_id      = local.vpc_id
  subnets     = local.routable_private_subnets

  security_group_ids = [
    aws_security_group.local.id,
    aws_security_group.egress.id,
    local.elastic_cloud_vpce_sg_id
  ]
}
