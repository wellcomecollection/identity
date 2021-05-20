# API Gateway

resource "aws_iam_role" "api_gateway_role" {
  name               = "identity-api-gateway-role-${terraform.workspace}"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "apigateway.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

  tags = {
    "Name" = "identity-api-gateway-role-${terraform.workspace}"
  }
}

resource "aws_iam_role_policy_attachment" "api_gateway_role" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}
