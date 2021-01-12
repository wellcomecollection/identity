resource "aws_ecs_cluster" "cluster" {
  name = "identity-cluster-${terraform.workspace}"

  capacity_providers = [
    "FARGATE_SPOT",
    "FARGATE"
  ]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
  }

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-cluster-${terraform.workspace}"
    }
  )
}

# Account Management System

module "ams_log_router_container" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/firelens?ref=v3.3.1"

  namespace = "identity-account-management-system-${terraform.workspace}"
}

module "ams_log_router_permissions" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/secrets?ref=v3.3.1"

  secrets   = module.ams_log_router_container.shared_secrets_logging
  role_name = module.ams_task_definition.task_execution_role_name
}

module "ams_container_definition" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/container_definition?ref=v3.3.1"

  name  = "identity-account-management-system-${terraform.workspace}"
  image = "${var.ams_image_repo}:${var.ams_image_tag}"

  port_mappings = [{
    containerPort = var.ams_container_port
    hostPort      = 80
    protocol      = "tcp"
  }]

  log_configuration = module.ams_log_router_container.container_log_configuration
}

module "ams_task_definition" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/task_definition?ref=v3.3.1"

  task_name = "identity-account-management-system-${terraform.workspace}"

  launch_types = ["FARGATE"]

  container_definitions = [
    module.ams_log_router_container.container_definition,
    module.ams_container_definition.container_definition
  ]

  cpu    = var.ams_cpu
  memory = var.ams_memory
}

module "ams_service" {
  source = "git::https://github.com/wellcomecollection/terraform-aws-ecs-service.git//modules/service?ref=v3.3.1"

  service_name        = "identity-account-management-system-${terraform.workspace}"
  cluster_arn         = aws_ecs_cluster.cluster.arn
  task_definition_arn = module.ams_task_definition.arn

  container_name = module.ams_container_definition.name
  container_port = var.ams_container_port

  subnets = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id,
    aws_subnet.private_3.id
  ]

  target_group_arn = aws_alb_target_group.account_management_system.arn

  security_group_ids = [
    aws_security_group.local.id,
    aws_security_group.egress.id
  ]
}
