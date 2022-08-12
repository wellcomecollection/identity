resource "aws_api_gateway_rest_api" "identity" {
  name = "identity-${terraform.workspace}"

  tags = {
    "Name" = "identity-${terraform.workspace}"
  }
}

module "users_route" {
  source = "../modules/route"

  label     = "/users"
  path_part = "users"

  rest_api_id = aws_api_gateway_rest_api.identity.id
  parent_id   = aws_api_gateway_rest_api.identity.root_resource_id
}

module "users_userid_route" {
  source = "../modules/route"

  label     = "/users/:user_id"
  path_part = "{userId}"

  responses = {
    OPTIONS = ["204"]
    GET     = ["200", "401", "403", "404", "500"]
    PUT     = ["200", "400", "401", "403", "404", "409", "500"]
  }

  parent_id = module.users_route.id

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  lambda_invoke_uri    = aws_lambda_alias.api_current.invoke_arn
}

locals {
  route_ids = {
    "/users"          = module.users_route.id
    "/users/:user_id" = module.users_userid_route.id
  }

  routes = {
    "/users/:user_id/registration" = {
      path_part = "registration"

      responses = {
        OPTIONS = ["204"]
        PUT     = ["200", "400", "401", "403", "404", "422", "500"]
      }
    }

    "/users/:user_id/password" = {
      path_part = "password"

      responses = {
        OPTIONS = ["204"]
        PUT     = ["200", "400", "401", "403", "404", "422", "500"]
      }
    }

    "/users/:user_id/deletion-request" = {
      path_part = "deletion-request"

      responses = {
        OPTIONS = ["204"]
        PUT     = ["200", "304", "401", "403", "404", "500"]
      }
    }

    "/users/:user_id/resend_verification_email" = {
      path_part = "resend_verification_email"

      responses = {
        OPTIONS = ["204"]
        POST    = ["204", "401", "403", "404", "429", "500"]
      }
    }

    "/users/:user_id/validate" = {
      path_part = "validate"

      responses = {
        OPTIONS = ["204"]
        POST    = ["200", "401", "403", "404", "429", "500"]
      }
    }

    "/users/:user_id/item-requests" = {
      path_part = "item-requests"

      responses = {
        OPTIONS = ["204"]
        POST    = ["202", "400", "401", "403", "404", "409", "500"]
        GET     = ["200", "401", "403", "404", "500"]
      }

      # These integrations are defined in `api-integrations.tf`, because
      # they look quite different to the other integrations.
      create_default_integrations = false
    }
  }
}

module "userid_routes" {
  source = "../modules/route"

  for_each = local.routes

  label     = each.key
  path_part = each.value.path_part
  responses = each.value.responses

  parent_id = local.route_ids["/users/:user_id"]

  create_default_integrations = lookup(each.value, "create_default_integrations", true)

  authorizer_id        = aws_api_gateway_authorizer.token_authorizer.id
  request_validator_id = aws_api_gateway_request_validator.full.id
  rest_api_id          = aws_api_gateway_rest_api.identity.id
  lambda_invoke_uri    = aws_lambda_alias.api_current.invoke_arn
}
