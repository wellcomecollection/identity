# API

resource "aws_api_gateway_documentation_part" "api" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/api.json")

  location {
    type = "API"
  }
}

# /auth

resource "aws_api_gateway_documentation_part" "auth" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.auth.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "auth_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.auth.path
    method = aws_api_gateway_method.auth_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "auth_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_options.http_method
    status_code = "204"
  }
}

# [POST]

resource "aws_api_gateway_documentation_part" "auth_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.auth.path
    method = aws_api_gateway_method.auth_post.http_method
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "auth_post_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_post.http_method
    status_code = "200"
  }
}

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "auth_post_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_post.http_method
    status_code = "401"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "auth_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_post.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "auth_post_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_post.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "auth_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/auth/post-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.auth.path
    method      = aws_api_gateway_method.auth_post.http_method
    status_code = "500"
  }
}

# /users

resource "aws_api_gateway_documentation_part" "users" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_options.http_method
    status_code = "204"
  }
}

# [GET]

resource "aws_api_gateway_documentation_part" "users_get" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_get_param_page" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-param-page.json")

  location {
    type   = "QUERY_PARAMETER"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
    name   = "page"
  }
}

resource "aws_api_gateway_documentation_part" "users_get_param_pagesize" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-param-pagesize.json")

  location {
    type   = "QUERY_PARAMETER"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
    name   = "pageSize"
  }
}

resource "aws_api_gateway_documentation_part" "users_get_param_sort" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-param-sort.json")

  location {
    type   = "QUERY_PARAMETER"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
    name   = "sort"
  }
}

resource "aws_api_gateway_documentation_part" "users_get_param_sortdir" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-param-sortdir.json")

  location {
    type   = "QUERY_PARAMETER"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
    name   = "sortDir"
  }
}

resource "aws_api_gateway_documentation_part" "users_get_param_query" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-param-query.json")

  location {
    type   = "QUERY_PARAMETER"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_get.http_method
    name   = "query"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_get_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "200"
  }
}

# 400 Bad Request

resource "aws_api_gateway_documentation_part" "users_get_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-400.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "400"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_get_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "403"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_get_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "500"
  }
}

# 503 Service Unavailable

resource "aws_api_gateway_documentation_part" "users_get_503" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-503.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "503"
  }
}

# [POST]

resource "aws_api_gateway_documentation_part" "users_post" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users.path
    method = aws_api_gateway_method.users_post.http_method
  }
}

# 201 Created

resource "aws_api_gateway_documentation_part" "users_post_201" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-201.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "201"
  }
}

# 400 Bad Request

resource "aws_api_gateway_documentation_part" "users_post_400" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-400.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "400"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_post_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "403"
  }
}

# 409 Conflict

resource "aws_api_gateway_documentation_part" "users_post_409" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-409.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "409"
  }
}

# 422 Unprocessable Entity

resource "aws_api_gateway_documentation_part" "users_post_422" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-422.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "422"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_post_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/post-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_post.http_method
    status_code = "500"
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

# [DELETE]

resource "aws_api_gateway_documentation_part" "users_userid_delete" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_delete.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_delete_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid.path
    method = aws_api_gateway_method.users_userid_delete.http_method
    name   = "userId"
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_delete_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_delete.http_method
    status_code = "204"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_delete_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_delete.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_delete_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_delete.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_delete_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/delete-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid.path
    method      = aws_api_gateway_method.users_userid_delete.http_method
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

# /users/:user_id/reset-password

resource "aws_api_gateway_documentation_part" "users_userid_reset-password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_reset-password.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_reset-password.path
    method = aws_api_gateway_method.users_userid_reset-password_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_reset-password.path
    method      = aws_api_gateway_method.users_userid_reset-password_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_reset-password.path
    method = aws_api_gateway_method.users_userid_reset-password_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_reset-password.path
    method = aws_api_gateway_method.users_userid_reset-password_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_reset-password.path
    method      = aws_api_gateway_method.users_userid_reset-password_put.http_method
    status_code = "200"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_reset-password.path
    method      = aws_api_gateway_method.users_userid_reset-password_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_reset-password.path
    method      = aws_api_gateway_method.users_userid_reset-password_put.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_reset-password_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_reset-password.path
    method      = aws_api_gateway_method.users_userid_reset-password_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/send-verification

resource "aws_api_gateway_documentation_part" "users_userid_send-verification" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_send-verification.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_send-verification.path
    method = aws_api_gateway_method.users_userid_send-verification_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_send-verification.path
    method = aws_api_gateway_method.users_userid_send-verification_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_send-verification.path
    method = aws_api_gateway_method.users_userid_send-verification_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_put.http_method
    status_code = "200"
  }
}

# 304 Not Modified

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_304" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-304.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_put.http_method
    status_code = "304"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_put.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_send-verification_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_send-verification.path
    method      = aws_api_gateway_method.users_userid_send-verification_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/lock

resource "aws_api_gateway_documentation_part" "users_userid_lock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_lock.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_lock_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_lock.path
    method = aws_api_gateway_method.users_userid_lock_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_lock_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_lock.path
    method      = aws_api_gateway_method.users_userid_lock_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_lock_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_lock.path
    method = aws_api_gateway_method.users_userid_lock_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_lock_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_lock.path
    method = aws_api_gateway_method.users_userid_lock_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_lock_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_lock.path
    method      = aws_api_gateway_method.users_userid_lock_put.http_method
    status_code = "200"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_lock_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_lock.path
    method      = aws_api_gateway_method.users_userid_lock_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_lock_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_lock.path
    method      = aws_api_gateway_method.users_userid_lock_put.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_lock_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_lock.path
    method      = aws_api_gateway_method.users_userid_lock_put.http_method
    status_code = "500"
  }
}

# /users/:user_id/unlock

resource "aws_api_gateway_documentation_part" "users_userid_unlock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_unlock.path
  }
}

# [OPTIONS]

resource "aws_api_gateway_documentation_part" "users_userid_unlock_options" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/options.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_unlock.path
    method = aws_api_gateway_method.users_userid_unlock_options.http_method
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_unlock_options_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/options-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_unlock.path
    method      = aws_api_gateway_method.users_userid_unlock_options.http_method
    status_code = "204"
  }
}

# [PUT]

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_unlock.path
    method = aws_api_gateway_method.users_userid_unlock_put.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_unlock.path
    method = aws_api_gateway_method.users_userid_unlock_put.http_method
    name   = "userId"
  }
}

# 200 OK

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put_200" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put-200.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_unlock.path
    method      = aws_api_gateway_method.users_userid_unlock_put.http_method
    status_code = "200"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_unlock.path
    method      = aws_api_gateway_method.users_userid_unlock_put.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_unlock.path
    method      = aws_api_gateway_method.users_userid_unlock_put.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_unlock_put_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/put-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_unlock.path
    method      = aws_api_gateway_method.users_userid_unlock_put.http_method
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

# [DELETE]

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete.json")

  location {
    type   = "METHOD"
    path   = aws_api_gateway_resource.users_userid_deletion-request.path
    method = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
  }
}

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_param_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-param-userid.json")

  location {
    type   = "PATH_PARAMETER"
    path   = aws_api_gateway_resource.users_userid_deletion-request.path
    method = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    name   = "userId"
  }
}

# 204 No Content

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_204" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-204.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    status_code = "204"
  }
}

# 304 Not Modified

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_304" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-304.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    status_code = "304"
  }
}

# 403 Forbidden

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_403" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-403.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    status_code = "403"
  }
}

# 404 Not Found

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_404" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-404.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    status_code = "404"
  }
}

# 500 Internal Server Error

resource "aws_api_gateway_documentation_part" "users_userid_deletion-request_delete_500" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/deletion-request/delete-500.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users_userid_deletion-request.path
    method      = aws_api_gateway_method.users_userid_deletion-request_delete.http_method
    status_code = "500"
  }
}
