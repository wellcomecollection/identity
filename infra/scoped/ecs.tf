# Cluster

resource "aws_ecs_cluster" "cluster" {
  name = "identity-cluster-${terraform.workspace}"

  capacity_providers = [
    "FARGATE"
  ]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
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

resource "aws_ecs_service" "account_management_system" {
  name            = "identity-account-management-system-${terraform.workspace}"
  cluster         = aws_ecs_cluster.cluster.arn
  task_definition = aws_ecs_task_definition.account_management_system.arn

  launch_type   = "FARGATE"
  desired_count = var.ams_instance_count

  network_configuration {
    subnets = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id,
      aws_subnet.private_3.id
    ]

    security_groups = [
      aws_security_group.local.id,
      aws_security_group.egress.id
    ]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.account_management_system.arn
    container_name   = "account-management-system"
    container_port   = var.ams_container_port
  }

  lifecycle {
    ignore_changes = [
      task_definition
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-account-management-system-${terraform.workspace}"
    }
  )
}


resource "aws_ecs_task_definition" "account_management_system" {
  family = "identity-account-management-system-${terraform.workspace}"

  task_role_arn      = aws_iam_role.ecs_task_role.arn
  execution_role_arn = aws_iam_role.ecs_execution_role.arn

  network_mode = "awsvpc"

  cpu    = var.ams_cpu
  memory = var.ams_memory

  requires_compatibilities = [
    "FARGATE"
  ]

  container_definitions = data.template_file.account_management_system.rendered

  lifecycle {
    ignore_changes = [
      container_definitions
    ]
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-account-management-system-${terraform.workspace}"
    }
  )
}

data "template_file" "account_management_system" {
  template = file("${path.module}/task-definitions/account-management-system.json")
  vars = {
    account_id          = data.aws_caller_identity.current.account_id
    environment         = terraform.workspace
    ams_image_tag       = var.ams_image_tag
    ams_container_port  = var.ams_container_port
    koa_session_keys    = random_password.ams_koa_session_key.result
    auth0_client_secret = auth0_client.account_management_system.client_secret
    auth0_domain        = local.auth0_hostname
    auth0_client_id     = auth0_client.account_management_system.id
    auth0_callback_url  = local.ams_redirect_uri
    fluent_bit_repo     = var.fluent_bit_image_repo
    fluent_bit_tag      = var.fluent_bit_image_tag
  }
}

resource "random_password" "ams_koa_session_key" {
  length = 64
}
