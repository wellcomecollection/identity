resource "aws_api_gateway_model" "update-password" {
  name         = "UpdatePassword"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/password.json")
}

resource "aws_api_gateway_model" "user" {
  name         = "User"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/user.json")
}

resource "aws_api_gateway_model" "user-list" {
  name         = "UserList"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/user-list.json")
}

resource "aws_api_gateway_model" "create-user" {
  name         = "CreateUser"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/create-user.json")
}

resource "aws_api_gateway_model" "update-user" {
  name         = "UpdateUser"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/update-user.json")
}

resource "aws_api_gateway_model" "validate" {
  name         = "Validate"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/validate.json")
}

resource "aws_api_gateway_model" "item-request" {
  name         = "ItemRequest"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/item-request.json")
}

resource "aws_api_gateway_model" "item-request-list" {
  name         = "ItemRequest"
  rest_api_id  = aws_api_gateway_rest_api.identity.id
  content_type = "application/json"
  schema       = file("${path.module}/../../models/item-request-list.json")
}
