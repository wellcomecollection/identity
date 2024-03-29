locals {
  options_codes = lookup(var.responses, "OPTIONS", [])

  get_codes = lookup(var.responses, "GET", [])
  get_success_codes = [
    for code in local.get_codes : code if parseint(code, 10) < 400
  ]
  get_error_codes = [
    for code in local.get_codes : code if parseint(code, 10) >= 400
  ]

  put_codes = lookup(var.responses, "PUT", [])
  put_success_codes = [
    for code in local.put_codes : code if parseint(code, 10) < 400
  ]
  put_error_codes = [
    for code in local.put_codes : code if parseint(code, 10) >= 400
  ]

  post_codes = lookup(var.responses, "POST", [])
  post_success_codes = [
    for code in local.post_codes : code if parseint(code, 10) < 400
  ]
  post_error_codes = [
    for code in local.post_codes : code if parseint(code, 10) >= 400
  ]
}

# [OPTIONS]

resource "aws_api_gateway_method" "options" {
  count = length(local.options_codes) > 0 ? 1 : 0

  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options" {
  for_each = toset(local.options_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.options[0].http_method

  status_code = each.key

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

resource "aws_api_gateway_method" "get" {
  count = length(local.get_codes) > 0 ? 1 : 0

  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.resource.id
  http_method          = "GET"
  authorization        = "CUSTOM"
  authorizer_id        = var.authorizer_id
  api_key_required     = true
  request_validator_id = var.request_validator_id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

resource "aws_api_gateway_method_response" "get_success" {
  for_each = toset(local.get_success_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.get[0].http_method

  status_code = each.key

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "get_errors" {
  for_each = toset(local.get_error_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.get[0].http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [PUT]

resource "aws_api_gateway_method" "put" {
  count = length(local.put_codes) > 0 ? 1 : 0

  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.resource.id
  http_method          = "PUT"
  authorization        = "CUSTOM"
  authorizer_id        = var.authorizer_id
  api_key_required     = true
  request_validator_id = var.request_validator_id

  request_parameters = {
    "method.request.path.userId" = true
  }
}

resource "aws_api_gateway_method_response" "put_success" {
  for_each = toset(local.put_success_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.put[0].http_method

  status_code = each.key

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "put_errors" {
  for_each = toset(local.put_error_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.put[0].http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

# [POST]

resource "aws_api_gateway_method" "post" {
  count = length(local.post_codes) > 0 ? 1 : 0

  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.resource.id
  http_method          = "POST"
  authorization        = "CUSTOM"
  authorizer_id        = var.authorizer_id
  api_key_required     = true
  request_validator_id = var.request_validator_id

  request_parameters = {
    "method.request.path.userId" = true
  }
}


resource "aws_api_gateway_method_response" "post_success" {
  for_each = toset(local.post_success_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.post[0].http_method

  status_code = each.key

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "post_errors" {
  for_each = toset(local.post_error_codes)

  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id

  # Note: this has the side effect of ensuring the method resource
  # is created before the method response resource.
  #
  # If you hard-code the method here, you may get an error:
  #
  #     Error creating API Gateway Integration: NotFoundException:
  #     Invalid Method identifier specified
  #
  # I think ensuring the method is created first resolves it.
  http_method = aws_api_gateway_method.post[0].http_method

  status_code = each.key

  response_models = {
    "application/json" = "Error"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}
