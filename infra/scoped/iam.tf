# API Gateway Lambda Functions

data "aws_iam_policy_document" "deletion_lambda_dlq" {
  statement {
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.deletion_lambda_dlq.arn]
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

resource "aws_iam_policy" "send_email" {
  name   = "send-email-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.send_email.json
}

resource "aws_iam_policy" "deletion_lambda_dlq" {
  name   = "deletion-lambda-dlq-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.deletion_lambda_dlq.json
}

resource "aws_iam_role_policy_attachment" "deletion_lambda_dlq" {
  role       = module.patron_deletion_tracker_lambda.lambda_role.name
  policy_arn = aws_iam_policy.deletion_lambda_dlq.arn
}

resource "aws_iam_role_policy_attachment" "identity_api_gateway_lambda_send_email" {
  role       = module.api_lambda.lambda_role.name
  policy_arn = aws_iam_policy.send_email.arn
}

resource "aws_iam_role_policy_attachment" "AWSLambdaVPCAccessExecutionRole" {
  role       = module.api_lambda.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}
