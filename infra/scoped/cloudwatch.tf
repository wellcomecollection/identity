# API Gateway

resource "aws_cloudwatch_log_group" "identity_api_gateway_v1_access_log" {
  name              = "API-Gateway-Access-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = {
    "Name" = "API-Gateway-Access-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  }
}

resource "aws_cloudwatch_log_group" "identity_api_gateway_v1_execution_log" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  retention_in_days = aws_ssm_parameter.cloudwatch_retention.value

  tags = {
    "Name" = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.identity.id}/${local.identity_v1}"
  }
}

# Events

resource "aws_cloudwatch_event_rule" "patron_deletion_tracker" {
  name                = "patron-deletion-tracker-${terraform.workspace}"
  description         = "Triggers the Patron deletion tracker lambda"
  schedule_expression = "rate(1 day)"
  is_enabled          = true
}

resource "aws_cloudwatch_event_target" "patron_deletion_tracker" {
  rule      = aws_cloudwatch_event_rule.patron_deletion_tracker.name
  target_id = "patron-deletion-tracker-${terraform.workspace}"
  arn       = module.patron_deletion_tracker_lambda.lambda.arn
  input = jsonencode({
    window = {
      durationDays = local.deletion_tracking_window_days
    }
  })
}

resource "aws_cloudwatch_metric_alarm" "lambda_alarm" {
  alarm_name          = "lambda-patron-deletion-tracker-${terraform.workspace}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"

  dimensions = {
    FunctionName = module.patron_deletion_tracker_lambda.lambda.function_name
  }

  alarm_description = "This metric monitors lambda errors for the patron deletion tracker"
  alarm_actions     = [local.lambda_alerts_topic_arn]
}
