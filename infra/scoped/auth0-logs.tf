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
}

resource "aws_cloudwatch_event_bus" "auth0_logs" {
  // These must match as per
  // https://docs.aws.amazon.com/eventbridge/latest/APIReference/API_CreateEventBus.html#API_CreateEventBus_RequestSyntax
  name              = local.auth0_logs_event_source
  event_source_name = local.auth0_logs_event_source
}

data "aws_region" "current" {}
