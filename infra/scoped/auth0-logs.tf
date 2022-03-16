resource "auth0_log_stream" "eventbridge" {
  name   = "Amazon EventBridge"
  type   = "eventbridge"
  status = "active"

  sink {
    aws_account_id = data.aws_caller_identity.current.account_id
    aws_region     = data.aws_region.current.name
  }
}

locals {
  auth0_logs_event_source = auth0_log_stream.eventbridge.sink[0].aws_partner_event_source
  tenant_name             = split(".", aws_ssm_parameter.auth0_domain.value)[0]
}

resource "aws_cloudwatch_event_bus" "auth0_logs" {
  // These must match as per
  // https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_CreateEventBus.html#API_CreateEventBus_RequestSyntax
  name              = local.auth0_logs_event_source
  event_source_name = local.auth0_logs_event_source
}

resource "aws_cloudwatch_event_rule" "auth0_logs" {
  name        = "capture-auth0-errors-${terraform.workspace}"
  description = "Capture Auth0 errors that indicate unexpected behaviour"
  is_enabled  = true

  event_bus_name = aws_cloudwatch_event_bus.auth0_logs.name

  event_pattern = jsonencode({
    // This is a code that corresponds to the event type as per
    // https://auth0.com/docs/deploy-monitor/logs/log-event-type-codes
    type = [
      // Ignore any successes
      { anything-but : { prefix = "s" } },
    ]
  })
}

resource "aws_cloudwatch_event_target" "auth0_logs_lambda" {
  target_id = "auth0-logs-lambda-${terraform.workspace}"

  arn = local.monitoring_outputs["auth0_log_stream_lambda_arn"]

  rule           = aws_cloudwatch_event_rule.auth0_logs.name
  event_bus_name = aws_cloudwatch_event_bus.auth0_logs.name

  input_transformer {
    input_paths = {
      log_id = "$.log_id"
    }

    input_template = jsonencode({
      environment = terraform.workspace
      tenant_name = local.tenant_name,
      log_id      = "<log_id>"
    })
  }
}

data "aws_region" "current" {}
