# API Gateway Lambda Functions

resource "aws_iam_role" "identity_api_gateway_lambda_role" {
  name               = "identity-api-gateway-lambda-role-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = {
    "Name" = "identity-api-gateway-lambda-role-${terraform.workspace}"
  }
}

resource "aws_iam_role" "patron_deletion_tracker" {
  name               = "patron-deletion-tracker-${terraform.workspace}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = {
    "Name" = "patron-deletion-tracker-${terraform.workspace}"
  }
}

data "aws_iam_policy_document" "deletion_lambda_dlq" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.deletion_lambda_dlq.arn]
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    effect = "Allow"
  }
}

data "aws_iam_policy_document" "log_creation" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "arn:aws:logs:*:*:*"
    ]
    effect = "Allow"
  }
}

data "aws_iam_policy_document" "send_email" {
  statement {
    actions = [
      "ses:SendEmail"
    ]
    resources = [
      "arn:aws:ses:eu-west-1:${data.aws_caller_identity.current.account_id}:identity/${data.aws_ssm_parameter.email_domain.value}"
    ]
  }
}

resource "aws_iam_policy" "log_creation" {
  name   = "log-creation-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.log_creation.json
}

resource "aws_iam_policy" "send_email" {
  name   = "send-email-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.send_email.json
}

resource "aws_iam_policy" "deletion_lambda_dlq" {
  name   = "deletion-lambda-dlq-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.deletion_lambda_dlq.json
}

resource "aws_iam_role_policy_attachment" "patron_deletion_tracker_log_creation" {
  role       = aws_iam_role.patron_deletion_tracker.name
  policy_arn = aws_iam_policy.log_creation.arn
}

resource "aws_iam_role_policy_attachment" "deletion_lambda_dlq" {
  role       = aws_iam_role.patron_deletion_tracker.name
  policy_arn = aws_iam_policy.deletion_lambda_dlq.arn
}

resource "aws_iam_role_policy_attachment" "identity_api_gateway_lambda_log_creation" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = aws_iam_policy.log_creation.arn
}

resource "aws_iam_role_policy_attachment" "identity_api_gateway_lambda_send_email" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = aws_iam_policy.send_email.arn
}

resource "aws_iam_role_policy_attachment" "AWSLambdaVPCAccessExecutionRole" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
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
