resource "aws_api_gateway_documentation_version" "identity_v1" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  version     = local.identity_v1_hostname

  depends_on = [
    aws_api_gateway_documentation_part.api,
    aws_api_gateway_documentation_part.auth,
    aws_api_gateway_documentation_part.auth_post,
    aws_api_gateway_documentation_part.users,
    aws_api_gateway_documentation_part.users_get,
    aws_api_gateway_documentation_part.users_post,
    aws_api_gateway_documentation_part.users_userid,
    aws_api_gateway_documentation_part.users_userid_get,
    aws_api_gateway_documentation_part.users_userid_put,
    aws_api_gateway_documentation_part.users_userid_delete,
    aws_api_gateway_documentation_part.users_userid_password,
    aws_api_gateway_documentation_part.users_userid_password_put,
    aws_api_gateway_documentation_part.users_userid_reset-password,
    aws_api_gateway_documentation_part.users_userid_reset-password_put,
    aws_api_gateway_documentation_part.users_userid_send-verification,
    aws_api_gateway_documentation_part.users_userid_send-verification_put,
    aws_api_gateway_documentation_part.users_userid_lock,
    aws_api_gateway_documentation_part.users_userid_lock_put,
    aws_api_gateway_documentation_part.users_userid_unlock,
    aws_api_gateway_documentation_part.users_userid_unlock_put
  ]
}

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

# /users

resource "aws_api_gateway_documentation_part" "users" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users.path
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

# 401 Unauthorized

resource "aws_api_gateway_documentation_part" "users_get_401" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/get-401.json")

  location {
    type        = "RESPONSE"
    path        = aws_api_gateway_resource.users.path
    method      = aws_api_gateway_method.users_get.http_method
    status_code = "401"
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

# /users/:user_id

resource "aws_api_gateway_documentation_part" "users_userid" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid.path
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

# /users/:user_id/password

resource "aws_api_gateway_documentation_part" "users_userid_password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/password/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_password.path
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

# /users/:user_id/reset-password

resource "aws_api_gateway_documentation_part" "users_userid_reset-password" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/reset-password/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_reset-password.path
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

# /users/:user_id/send-verification

resource "aws_api_gateway_documentation_part" "users_userid_send-verification" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/send-verification/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_send-verification.path
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

# /users/:user_id/lock

resource "aws_api_gateway_documentation_part" "users_userid_lock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/lock/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_lock.path
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

# /users/:user_id/unlock

resource "aws_api_gateway_documentation_part" "users_userid_unlock" {
  rest_api_id = aws_api_gateway_rest_api.identity.id
  properties  = file("${path.module}/api-documentation/users/:user_id/unlock/resource.json")

  location {
    type = "RESOURCE"
    path = aws_api_gateway_resource.users_userid_unlock.path
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
