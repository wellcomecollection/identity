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
