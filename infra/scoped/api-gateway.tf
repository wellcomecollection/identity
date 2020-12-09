resource "aws_api_gateway_rest_api" "identity" {
  name = "identity-${terraform.workspace}"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-${terraform.workspace}"
    }
  )
}

# /auth

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
  path_part   = "auth"
}

# [OPTIONS]

resource "aws_api_gateway_method" "auth_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.auth.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "auth_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [POST]

resource "aws_api_gateway_method" "auth_post" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.auth.id
  http_method          = "POST"
  authorization        = "NONE"
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_models = {
    "application/json" = aws_api_gateway_model.auth.name
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "auth_post_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "auth_post_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "auth_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "auth_post_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "auth_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.auth.id
  http_method = aws_api_gateway_method.auth_post.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
  path_part   = "users"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [GET]

resource "aws_api_gateway_method" "users_get" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users.id
  http_method          = "GET"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.querystring.page"     = true,
    "method.request.querystring.pageSize" = true,
    "method.request.querystring.query"    = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method
  status_code = "200"

  response_models = {
    "application/json" = aws_api_gateway_model.user-list.name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_get_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_get_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_get_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [POST]

resource "aws_api_gateway_method" "users_post" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users.id
  http_method          = "POST"
  authorization        = "NONE"
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_models = {
    "application/json" = aws_api_gateway_model.create-user.name
  }
}

# 201 Created

resource "aws_api_gateway_method_response" "users_post_201" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method
  status_code = "201"

  response_models = {
    "application/json" = aws_api_gateway_model.user.name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_post_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 409 Conflict

resource "aws_api_gateway_method_response" "users_post_409" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method
  status_code = "409"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_post.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id

resource "aws_api_gateway_resource" "users_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{userId}"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [GET]

resource "aws_api_gateway_method" "users_userid_get" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid.id
  http_method          = "GET"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method
  status_code = "200"

  response_models = {
    "application/json" = aws_api_gateway_model.user.name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_get_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_get_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_get_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_get.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_models = {
    "application/json" = aws_api_gateway_model.update-user.name
  }

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = aws_api_gateway_model.user.name
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_userid_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 409 Conflict

resource "aws_api_gateway_method_response" "users_userid_put_409" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "409"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [DELETE]

resource "aws_api_gateway_method" "users_userid_delete" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid.id
  http_method          = "DELETE"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_delete_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_delete.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_delete_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_delete.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_delete_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_delete.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_delete_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid.id
  http_method = aws_api_gateway_method.users_userid_delete.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/password

resource "aws_api_gateway_resource" "users_userid_password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "password"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_password_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_password.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_password_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_password_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_password.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_models = {
    "application/json" = aws_api_gateway_model.update-password.name
  }

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_password_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 400 Bad Request

resource "aws_api_gateway_method_response" "users_userid_password_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "400"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_password_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_password_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_password_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_password.id
  http_method = aws_api_gateway_method.users_userid_password_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/reset-password

resource "aws_api_gateway_resource" "users_userid_reset-password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "reset-password"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_reset-password_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_reset-password.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_reset-password_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_reset-password_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_reset-password.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_reset-password_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_reset-password_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_reset-password_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_reset-password_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_reset-password.id
  http_method = aws_api_gateway_method.users_userid_reset-password_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/send-verification

resource "aws_api_gateway_resource" "users_userid_send-verification" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "send-verification"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_send-verification_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_send-verification.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_send-verification_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_send-verification_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_send-verification.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_send-verification_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_send-verification_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_send-verification_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_send-verification_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_send-verification.id
  http_method = aws_api_gateway_method.users_userid_send-verification_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/lock

resource "aws_api_gateway_resource" "users_userid_lock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "lock"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_lock_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_lock.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_lock_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_lock_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_lock.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_lock_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_lock_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_lock_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_lock_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_lock.id
  http_method = aws_api_gateway_method.users_userid_lock_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# /users/:user_id/unlock

resource "aws_api_gateway_resource" "users_userid_unlock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "unlock"
}

# [OPTIONS]

resource "aws_api_gateway_method" "users_userid_unlock_options" {
  rest_api_id   = aws_api_gateway_rest_api.identity.id
  resource_id   = aws_api_gateway_resource.users_userid_unlock.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# 204 No Content

resource "aws_api_gateway_method_response" "users_userid_unlock_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_options.http_method
  status_code = "204"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_unlock_put" {
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  resource_id          = aws_api_gateway_resource.users_userid_unlock.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required     = true
  request_validator_id = aws_api_gateway_request_validator.full.id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

# 200 OK

resource "aws_api_gateway_method_response" "users_userid_unlock_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_put.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 403 Forbidden

resource "aws_api_gateway_method_response" "users_userid_unlock_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_put.http_method
  status_code = "403"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 404 Not Found

resource "aws_api_gateway_method_response" "users_userid_unlock_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_put.http_method
  status_code = "404"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_method_response" "users_userid_unlock_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users_userid_unlock.id
  http_method = aws_api_gateway_method.users_userid_unlock_put.http_method
  status_code = "500"

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}
