resource "aws_sqs_queue" "deletion_lambda_dlq" {
  name = "deletion-lambda-dlq-${terraform.workspace}"
}
