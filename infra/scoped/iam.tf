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

  tags = {
    "Name" = "identity-api-gateway-lambda-role-${terraform.workspace}"
  }
}

data "aws_iam_policy_document" "identity_api_gateway_lambda_policy" {
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

  statement {
    actions = [
      "ses:SendEmail"
    ]
    resources = [
      "arn:aws:ses:eu-west-1:${data.aws_caller_identity.current.account_id}:identity/${data.aws_ssm_parameter.email_domain.value}"
    ]
  }
}

resource "aws_iam_policy" "identity_api_gateway_lambda_policy" {
  name   = "identity-api-gateway-lambda-policy-${terraform.workspace}"
  policy = data.aws_iam_policy_document.identity_api_gateway_lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "identity_api_gateway_lambda_policy" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = aws_iam_policy.identity_api_gateway_lambda_policy.arn
}

resource "aws_iam_role_policy_attachment" "AWSLambdaVPCAccessExecutionRole" {
  role       = aws_iam_role.identity_api_gateway_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# SES

resource "aws_iam_user" "auth0_email" {
  name = "auth0-email-${terraform.workspace}"

  tags = {
    "Name" = "auth0-email-${terraform.workspace}"
  }
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
