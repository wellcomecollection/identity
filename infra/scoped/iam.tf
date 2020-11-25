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
