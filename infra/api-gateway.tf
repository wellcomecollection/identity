resource "aws_api_gateway_rest_api" "identity" {
  name = "identity-${terraform.workspace}"

  tags = merge(
    local.common_tags,
    map(
      "name", "identity-${terraform.workspace}"
    )
  )
}

# /auth

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
  path_part   = "auth"
}

# [POST]

resource "aws_api_gateway_method" "auth_post" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.auth.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true

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
    "application/json" = aws_api_gateway_model.user.name
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
}

# /users

resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
  path_part   = "users"
}

# [GET]

resource "aws_api_gateway_method" "users_get" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users.id
  http_method      = "GET"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# 401 Unauthorized

resource "aws_api_gateway_method_response" "users_get_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  resource_id = aws_api_gateway_resource.users.id
  http_method = aws_api_gateway_method.users_get.http_method
  status_code = "401"

  response_models = {
    "application/json" = "Error"
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
}

# [POST]

resource "aws_api_gateway_method" "users_post" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true

  request_models = {
    "application/json" = aws_api_gateway_model.user.name
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
}

# /users/:user_id

resource "aws_api_gateway_resource" "users_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{userId}"
}

# [GET]

resource "aws_api_gateway_method" "users_userid_get" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid.id
  http_method      = "GET"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

  request_models = {
    "application/json" = aws_api_gateway_model.user.name
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
}

# [DELETE]

resource "aws_api_gateway_method" "users_userid_delete" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid.id
  http_method      = "DELETE"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# /users/:user_id/password

resource "aws_api_gateway_resource" "users_userid_password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "password"
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_password_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid_password.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# /users/:user_id/reset-password

resource "aws_api_gateway_resource" "users_userid_reset-password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "reset-password"
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_reset-password_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid_reset-password.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# /users/:user_id/send-verification

resource "aws_api_gateway_resource" "users_userid_send-verification" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "send-verification"
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_send-verification_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid_send-verification.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# /users/:user_id/lock

resource "aws_api_gateway_resource" "users_userid_lock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "lock"
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_lock_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid_lock.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}

# /users/:user_id/unlock

resource "aws_api_gateway_resource" "users_userid_unlock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_resource.users_userid.id
  path_part   = "unlock"
}

# [PUT]

resource "aws_api_gateway_method" "users_userid_unlock_put" {
  rest_api_id      = aws_api_gateway_rest_api.identity.id
  resource_id      = aws_api_gateway_resource.users_userid_unlock.id
  http_method      = "PUT"
  authorization    = "CUSTOM"
  authorizer_id    = aws_api_gateway_authorizer.token_authorizer.id
  api_key_required = true

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
}