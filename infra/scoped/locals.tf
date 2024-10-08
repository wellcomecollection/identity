locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by

    TerraformConfigurationURL = "https://github.com/wellcomecollection/identity/tree/main/infra/scoped"
  }

  stage_test_client_ids = concat(auth0_client.local_dev_client.*.client_id, [
    # Developer client ids can be added here
    "SrigIHZ3yXKlskZcdxJeytBuHqUUw7gn", // "David McCormick – Local Dev"
  ])

  # Terraform
  environment_qualifier = terraform.workspace != "prod" ? " (${upper(terraform.workspace)})" : ""

  # Email
  email_support_address          = "${local.email_support_user}@${data.aws_ssm_parameter.email_domain.value}"
  email_noreply_address          = "${local.email_noreply_user}@${data.aws_ssm_parameter.email_domain.value}"
  email_noreply_name_and_address = "${local.email_noreply_name} <${local.email_noreply_address}>"

  # Credentials exported from static stack in the format:
  # {
  #   smtp_hostname = ???
  #   smtp_port = ???
  #   smtp_username = ???
  #   smtp_password = ???
  # }
  email_credentials = jsondecode(data.aws_secretsmanager_secret_version.email_credentials_secret_version.secret_string)

  hostname_prefix = trimspace(aws_ssm_parameter.external_parameters["hostname_prefix"].value)

  # API Gateway
  api_hostname = nonsensitive("api.${local.hostname_prefix}${data.aws_ssm_parameter.hostname.value}")

  # API Gateway V1
  identity_v1               = "v1"
  identity_v1_hostname      = "v1-${local.api_hostname}"
  identity_v1_endpoint      = "https://${local.identity_v1_hostname}"
  identity_v1_docs_hostname = "docs.${local.identity_v1_hostname}"
  identity_v1_docs_endpoint = "https://${local.identity_v1_docs_hostname}"

  # IIIF Image API client
  iiif_image_api_config = {
    "stage" = {
      allowed_logout_urls = [
        "https://localhost:5001/",
        "https://auth-test.wellcomecollection.digirati.io/",
        "https://iiif-test.wellcomecollection.org/auth/v2/access/2/eden/logout",
        "https://iiif-test.wellcomecollection.org/auth/v2/access/2/restrictedlogin/logout",
      ],
      callbacks = [
        "https://localhost:5001/callback",
        "https://auth-test.wellcomecollection.digirati.io/callback",
        "https://iiif-test.wellcomecollection.org/auth/v2/access/eden/oauth2/callback",
        "https://iiif-test.wellcomecollection.org/auth/v2/access/restrictedlogin/oauth2/callback",
      ]
    }
    "prod" = {
      allowed_logout_urls = [
        "https://iiif.wellcomecollection.org/auth/v2/access/2/eden/logout",
        "https://iiif.wellcomecollection.org/auth/v2/access/2/restrictedlogin/logout",
      ],
      callbacks = [
        "https://iiif.wellcomecollection.org/auth/v2/access/eden/oauth2/callback",
        "https://iiif.wellcomecollection.org/auth/v2/access/restrictedlogin/oauth2/callback",
      ]
    }
  }

  # Auth0
  auth0_hostname = nonsensitive("${local.hostname_prefix}${data.aws_ssm_parameter.hostname.value}")
  auth0_endpoint = "https://${local.auth0_hostname}"

  # Wellcome Collection Site
  wellcome_collection_hostnames = {
    stage = "www-stage.wellcomecollection.org",
    prod  = "wellcomecollection.org"
  }
  wellcome_collection_site_uri = "https://${local.wellcome_collection_hostnames[terraform.workspace]}"

  # Catalogue API
  catalogue_api_hostnames = {
    stage = "api-stage.wellcomecollection.org"
    prod  = "api.wellcomecollection.org"
  }
  catalogue_api_public_root = "https://${local.catalogue_api_hostnames[terraform.workspace]}/catalogue/v2"

  # Front-end / identity web app
  front_end_context_path         = "account"
  front_end_redirect_uri         = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}/api/auth/callback"
  front_end_login_uri            = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}/api/auth/login"
  front_end_error_uri            = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}/error"
  front_end_validate_uri         = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}/validated"
  front_end_delete_requested_uri = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}/delete-requested"
  front_end_base_uri             = "${local.wellcome_collection_site_uri}/${local.front_end_context_path}"

  # Identity account VPC
  identity_account_state = data.terraform_remote_state.accounts_identity.outputs

  environment_vpc_ids = {
    prod  = local.identity_account_state["identity_prod_vpc_id"]
    stage = local.identity_account_state["identity_stage_vpc_id"]
  }
  vpc_id = local.environment_vpc_ids[terraform.workspace]

  environment_private_subnets = {
    prod  = local.identity_account_state["identity_prod_vpc_private_subnets"]
    stage = local.identity_account_state["identity_stage_vpc_private_subnets"]
  }
  private_subnets = local.environment_private_subnets[terraform.workspace]

  # ECS services
  environment_elastic_cloud_vpce_sg_id = {
    prod  = data.terraform_remote_state.infra_critical.outputs["ec_identity_prod_privatelink_sg_id"]
    stage = data.terraform_remote_state.infra_critical.outputs["ec_identity_stage_privatelink_sg_id"]
  }
  elastic_cloud_vpce_sg_id = local.environment_elastic_cloud_vpce_sg_id[terraform.workspace]

  requests_lb_port    = 8000
  requests_repository = data.terraform_remote_state.catalogue_api_shared.outputs["ecr_requests_repository_url"]

  monitoring_outputs = data.terraform_remote_state.monitoring.outputs

  api_gateway_alerts_topic_arn = local.monitoring_outputs["identity_api_gateway_alerts_topic_arn"]
  lambda_alerts_topic_arn      = local.monitoring_outputs["identity_lambda_error_alerts_topic_arn"]
  auth0_log_stream_topic_arn   = local.monitoring_outputs["auth0_log_stream_topic_arn"]

  # This should be the max number of items that a user can order in Sierra.
  #
  # Although Sierra enforces the canonical limit, it's useful for the
  # requesting API to know what the limit should be -- it means we can
  # return a more helpful error message when a request fails because
  # somebody is at their hold limit.
  #
  # The hold limit was increased to 15 on 6 August 2021.
  # See https://wellcome.slack.com/archives/CUA669WHH/p1628089731008800
  per_user_hold_limit = 15

  one_minute_s = 60
  one_hour_s   = 60 * local.one_minute_s

  // These should match the values used by the frontend app
  // See: https://github.com/wellcomecollection/wellcomecollection.org/blob/f98e423c1ba75a703c9be07bba12c6060d55acab/identity/webapp/src/utility/auth0.ts#L80-L81
  session_absolute_lifetime_hours = 7 * 24
  session_rolling_lifetime_hours  = 8

  // The duration of the window in which to check for deleted Sierra patrons
  // and remove them from Auth0 if present
  deletion_tracking_window_days = 1
}
