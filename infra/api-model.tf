resource "aws_api_gateway_model" "auth" {
  name         = "Auth"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../lambda/models/auth.json")
}
resource "aws_api_gateway_model" "update-password" {
  name         = "UpdatePassword"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../lambda/models/update-password.json")
}

resource "aws_api_gateway_model" "user" {
  name         = "User"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../lambda/models/user.json")
}

resource "aws_api_gateway_model" "user-list" {
  name         = "UserList"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../lambda/models/user-list.json")
}
