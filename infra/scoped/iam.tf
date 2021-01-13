# API Gateway Lambda Functions

resource "aws_iam_role" "identity_api_gateway_lambda_role" {
  name               = "identity-api-gateway-lambda-role-${terraform.workspace}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-api-gateway-lambda-role-${terraform.workspace}"
    }
  )
}

resource "aws_iam_policy" "identity_api_gateway_lambda_policy" {
  name   = "identity-api-gateway-lambda-policy-${terraform.workspace}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "identity_api_gateway_lambda_policy" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = aws_iam_policy.identity_api_gateway_lambda_policy.arn
}

# SES

resource "aws_iam_user" "auth0_email" {
  name = "auth0-email-${terraform.workspace}"

  tags = merge(
    local.common_tags,
    {
      "Name" = "auth0-email-${terraform.workspace}"
    }
  )
}

resource "aws_iam_access_key" "auth0_email" {
  user = aws_iam_user.auth0_email.name
}

resource "aws_iam_user_policy" "auth0_email-ses_email_sending_policy" {
  user   = aws_iam_user.auth0_email.name
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ses:SendRawEmail"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

# S3

data "aws_iam_policy_document" "s3_swagger_ui_policy_v1" {
  statement {
    actions = [
      "s3:GetObject"
    ]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
    resources = [
      "arn:aws:s3:::identity-public-swagger-ui-${local.identity_v1}-${terraform.workspace}/*"
    ]
  }
}

# ECS

resource "aws_iam_role" "ecs_task_role" {
  name               = "identity-ecs-task-role-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_policy.json

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-ecs-task-role-${terraform.workspace}"
    }
  )
}

data "aws_iam_policy_document" "ecs_task_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution_role" {
  name               = "identity-ecs-execution-role-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_policy.json

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-ecs-execution-role-${terraform.workspace}"
    }
  )
}

resource "aws_iam_role_policy" "ecs_execution_policy" {
  role   = aws_iam_role.ecs_execution_role.name
  policy = data.aws_iam_policy_document.ecs_execution_policy_document.json
}

data "aws_iam_policy_document" "ecs_execution_policy_document" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "*",
    ]
  }

  statement {
    actions = [
      "ssm:GetParameters",
    ]

    resources = [
      "arn:aws:ssm:eu-west-1:${data.aws_caller_identity.current.account_id}:parameter/aws/reference/secretsmanager/shared/logging/es_user",
      "arn:aws:ssm:eu-west-1:${data.aws_caller_identity.current.account_id}:parameter/aws/reference/secretsmanager/shared/logging/es_port",
      "arn:aws:ssm:eu-west-1:${data.aws_caller_identity.current.account_id}:parameter/aws/reference/secretsmanager/shared/logging/es_pass",
      "arn:aws:ssm:eu-west-1:${data.aws_caller_identity.current.account_id}:parameter/aws/reference/secretsmanager/shared/logging/es_host"
    ]
  }

  statement {
    actions = [
      "secretsmanager:GetSecretValue",
    ]

    resources = [
      "arn:aws:secretsmanager:eu-west-1:${data.aws_caller_identity.current.account_id}:secret:shared/logging/es_user*",
      "arn:aws:secretsmanager:eu-west-1:${data.aws_caller_identity.current.account_id}:secret:shared/logging/es_port*",
      "arn:aws:secretsmanager:eu-west-1:${data.aws_caller_identity.current.account_id}:secret:shared/logging/es_pass*",
      "arn:aws:secretsmanager:eu-west-1:${data.aws_caller_identity.current.account_id}:secret:shared/logging/es_host*"
    ]
  }
}
