locals {
  identity_ci_role_name = element(
    split("/", local.identity_account_state.ci_role_arn),
    length(split("/", local.identity_account_state.ci_role_arn)) - 1
  )
}

resource "aws_iam_role_policy" "identity_ci" {
  name   = "smoke-tests-${terraform.workspace}"
  role   = local.identity_ci_role_name
  policy = data.aws_iam_policy_document.identity_ci.json
}

data "aws_iam_policy_document" "identity_ci" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
    ]

    resources = module.secrets.arns
  }

  statement {
    actions = [
      "ssm:GetParameter",
    ]

    resources = [aws_ssm_parameter.identity_web_app["auth0_domain"].arn]
  }
}