# API

resource "aws_api_gateway_documentation_part" "api" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/api.json")

  location {
    type = "API"
  }
}

# /users/:user_id

resource "aws_api_gateway_documentation_part" "users_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_options.http_method
    status_code = "204"
  }
}

# [GET]

resource "aws_api_gateway_documentation_part" "users_userid_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_get.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_get_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_get.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_get.http_method
    status_code = "200"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_userid_get_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_get.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_get_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_get.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_get_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_get.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_get_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/get-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_get.http_method
    status_code = "500"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "200"
  }
}

# 400 Bad Request

resource "aws_api_gateway_documentation_part" "users_userid_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-400.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "400"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_userid_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "404"
  }
}

# 409 Conflict

resource "aws_api_gateway_documentation_part" "users_userid_put_409" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-409.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "409"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/password

resource "aws_api_gateway_documentation_part" "users_userid_password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_password.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_password_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_password.path
    method = aws_api_gateway_method.users_userid_password_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_password_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_password.path
    method = aws_api_gateway_method.users_userid_password_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_password_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_password.path
    method = aws_api_gateway_method.users_userid_password_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_password_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "200"
  }
}

# 400 Bad Request

resource "aws_api_gateway_documentation_part" "users_userid_password_put_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-400.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "400"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_userid_password_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_password_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_password_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "404"
  }
}

# 422 Unprocessable Entity

resource "aws_api_gateway_documentation_part" "users_userid_password_put_422" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-422.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "422"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_password_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_password.path
    method      = aws_api_gateway_method.users_userid_password_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/deletion-request

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_deletion-request.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_deletion-request.path
    method = aws_api_gateway_method.users_userid_deletion-request_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_deletion-request.path
    method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_deletion-request.path
    method = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "200"
  }
}

# 304 Not Modified

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_304" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-304.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "304"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/validate

resource "aws_api_gateway_documentation_part" "users_userid_validate" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_validate.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_validate_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_validate.path
    method = aws_api_gateway_method.users_userid_validate_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_validate_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_options.http_method
    status_code = "204"
  }
}

# [POST]

resource "aws_api_gateway_documentation_part" "users_userid_validate_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_validate.path
    method = aws_api_gateway_method.users_userid_validate_post.http_method
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "200"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "404"
  }
}

# 429 Too Many Requests

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_429" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-429.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "429"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_validate_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/validate/post-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_validate.path
    method      = aws_api_gateway_method.users_userid_validate_post.http_method
    status_code = "500"
  }
}

# /users/:user_id/item-requests

resource "aws_api_gateway_documentation_part" "users_userid_item-requests" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_item-requests.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_item-requests.path
    method = aws_api_gateway_method.users_userid_item-requests_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_options.http_method
    status_code = "204"
  }
}

# [POST]

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_item-requests.path
    method = aws_api_gateway_method.users_userid_item-requests_post.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_202" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-202.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "202"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "401"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "403"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "404"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_409" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-409.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "409"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/post-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_post.http_method
    status_code = "500"
  }
}

# [GET]

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_item-requests.path
    method = aws_api_gateway_method.users_userid_item-requests_get.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_get.http_method
    status_code = "200"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_get.http_method
    status_code = "401"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_get.http_method
    status_code = "403"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_get.http_method
    status_code = "404"
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_item-requests_get_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/item-requests/get-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_item-requests.path
    method      = aws_api_gateway_method.users_userid_item-requests_get.http_method
    status_code = "500"
  }
}
