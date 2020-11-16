# stubs/authorizer.js

resource "aws_lambda_function" "stubs_authorizer" {
  function_name    = "identity-stubs-authorizer-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/authorizer.js.zip"
  handler          = "authorizer.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/authorizer.js.zip")

  depends_on = [data.archive_file.stubs_authorizer_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-authorizer-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_authorizer_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/authorizer.js"
  output_path = "${path.module}/../../lambda/src/stubs/authorizer.js.zip"
}

resource "aws_lambda_permission" "stubs_authorizer" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# stubs/empty-200.js

resource "aws_lambda_function" "stubs_empty-200" {
  function_name    = "identity-stubs-empty-200-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/empty-200.js.zip"
  handler          = "empty-200.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/empty-200.js.zip")

  depends_on = [data.archive_file.stubs_empty-200_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-empty-200-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_empty-200_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/empty-200.js"
  output_path = "${path.module}/../../lambda/src/stubs/empty-200.js.zip"
}

resource "aws_lambda_permission" "stubs_empty-200" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_empty-200.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# stubs/empty-201.js

resource "aws_lambda_function" "stubs_empty-201" {
  function_name    = "identity-stubs-empty-201-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/empty-201.js.zip"
  handler          = "empty-201.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/empty-201.js.zip")

  depends_on = [data.archive_file.stubs_empty-201_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-empty-201-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_empty-201_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/empty-201.js"
  output_path = "${path.module}/../../lambda/src/stubs/empty-201.js.zip"
}

resource "aws_lambda_permission" "stubs_empty-201" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_empty-201.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# stubs/empty-204.js

resource "aws_lambda_function" "stubs_empty-204" {
  function_name    = "identity-stubs-empty-204-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/empty-204.js.zip"
  handler          = "empty-204.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/empty-204.js.zip")

  depends_on = [data.archive_file.stubs_empty-204_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-empty-204-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_empty-204_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/empty-204.js"
  output_path = "${path.module}/../../lambda/src/stubs/empty-204.js.zip"
}

resource "aws_lambda_permission" "stubs_empty-204" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_empty-204.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# stubs/user.js

resource "aws_lambda_function" "stubs_user" {
  function_name    = "identity-stubs-user-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/user.js.zip"
  handler          = "user.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/user.js.zip")

  depends_on = [data.archive_file.stubs_user_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-user-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_user_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/user.js"
  output_path = "${path.module}/../../lambda/src/stubs/user.js.zip"
}

resource "aws_lambda_permission" "stubs_user" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}

# stubs/user-list.js

resource "aws_lambda_function" "stubs_user-list" {
  function_name    = "identity-stubs-user-list-${terraform.workspace}"
  filename         = "${path.module}/../../lambda/src/stubs/user-list.js.zip"
  handler          = "user-list.handler"
  role             = aws_iam_role.identity_api_gateway_lambda_role.arn
  runtime          = "nodejs12.x"
  source_code_hash = filebase64sha256("${path.module}/../../lambda/src/stubs/user-list.js.zip")

  depends_on = [data.archive_file.stubs_user-list_zip]

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-stubs-user-list-${terraform.workspace}"
    )
  )
}

data "archive_file" "stubs_user-list_zip" {
  type        = "zip"
  source_file = "${path.module}/../../lambda/src/stubs/user-list.js"
  output_path = "${path.module}/../../lambda/src/stubs/user-list.js.zip"
}

resource "aws_lambda_permission" "stubs_user-list" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stubs_user-list.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.identity.execution_arn}/*/*"
}
