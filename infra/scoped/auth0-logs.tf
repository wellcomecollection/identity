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
  tenant_name             = split(".", local.auth0_domain)[0]
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
  state       = "ENABLED"

  event_bus_name = aws_cloudwatch_event_bus.auth0_logs.name

  event_pattern = jsonencode({
    source = [local.auth0_logs_event_source]
    detail = {
      data = {
        type = [
          // Ignore any successes
          // This filter is here as well as in the monitoring stack Lambda
          // in order to reduce invocations of the former (as there are a lot of Auth0 events)
          // https://github.com/wellcomecollection/platform-infrastructure/blob/main/monitoring/slack_alerts/auth0_log_stream_alert/src/auth0_log_stream_alert.py
          { anything-but : { prefix = "s" } },
        ]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "auth0_log_stream_topic" {
  target_id = "auth0-logs-lambda-${terraform.workspace}"

  arn = local.auth0_log_stream_topic_arn

  rule           = aws_cloudwatch_event_rule.auth0_logs.name
  event_bus_name = aws_cloudwatch_event_bus.auth0_logs.name

  input_transformer {
    input_paths = {
      log_id          = "$.detail.log_id"
      log_event_type  = "$.detail.data.type"
      log_description = "$.detail.data.description"
    }

    input_template = <<EOF
{
  "environment": "${terraform.workspace}",
  "tenant_name": "${local.tenant_name}",
  "log_id": <log_id>,
  "log_event_type": <log_event_type>,
  "log_description": <log_description>
}
EOF
  }
}

resource "aws_sns_topic_policy" "allow_eventbridge_publish" {
  arn    = local.auth0_log_stream_topic_arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

data "aws_iam_policy_document" "sns_topic_policy" {
  statement {
    effect  = "Allow"
    actions = ["SNS:Publish"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [local.auth0_log_stream_topic_arn]
  }
}

data "aws_region" "current" {}
