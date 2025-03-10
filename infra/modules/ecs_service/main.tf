module "log_router_container" {
  source    = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/firelens?ref=v3.13.1"
  namespace = var.service_name

  use_privatelink_endpoint = true
}

module "log_router_container_secrets_permissions" {
  source    = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/secrets?ref=v3.13.1"
  secrets   = module.log_router_container.shared_secrets_logging
  role_name = module.task_definition.task_execution_role_name
}

module "nginx_container" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/nginx/apigw?ref=v3.13.1"

  forward_port      = var.container_port
  log_configuration = module.log_router_container.container_log_configuration
}

module "app_container" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/container_definition?ref=v3.13.1"
  name   = "app"

  image = var.container_image

  environment = var.environment
  secrets     = var.secrets

  log_configuration = module.log_router_container.container_log_configuration
}

module "app_container_secrets_permissions" {
  source    = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/secrets?ref=v3.13.1"
  secrets   = var.secrets
  role_name = module.task_definition.task_execution_role_name
}

module "task_definition" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/task_definition?ref=v3.13.1"

  cpu    = var.app_cpu
  memory = var.app_memory

  container_definitions = [
    module.log_router_container.container_definition,
    module.app_container.container_definition,
    module.nginx_container.container_definition
  ]

  task_name = var.service_name
}

module "service" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/service?ref=v3.13.1"

  cluster_arn  = var.cluster_arn
  service_name = var.service_name

  task_definition_arn = module.task_definition.arn

  subnets            = var.subnets
  security_group_ids = var.security_group_ids

  desired_task_count = var.desired_task_count
  use_fargate_spot   = var.use_fargate_spot

  target_group_arn = aws_lb_target_group.tcp.arn

  container_name = module.nginx_container.container_name
  container_port = module.nginx_container.container_port
}
