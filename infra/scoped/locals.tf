locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "Project"     = var.tag_project
    "Environment" = terraform.workspace
    "ManagedBy"   = var.tag_managed_by
  }

  stage_test_client_ids = compact([
    length(auth0_client.dummy_test) > 0 ? auth0_client.dummy_test[0].client_id : ""
    # Developer client ids can be added here
  ])

  # Terraform
  environment_qualifier = terraform.workspace != "prod" ? " (${upper(terraform.workspace)})" : ""

  # Email
  email_support_address          = "${aws_ssm_parameter.email_support_user.value}@${data.aws_ssm_parameter.email_domain.value}"
  email_noreply_address          = "${aws_ssm_parameter.email_noreply_user.value}@${data.aws_ssm_parameter.email_domain.value}"
  email_noreply_name_and_address = "${aws_ssm_parameter.email_noreply_name.value} <${local.email_noreply_address}>"

  # API Gateway
  api_hostname = "api.${trimspace(aws_ssm_parameter.hostname_prefix.value)}${data.aws_ssm_parameter.hostname.value}"

  # API Gateway V1
  identity_v1               = "v1"
  identity_v1_hostname      = "v1-${local.api_hostname}"
  identity_v1_endpoint      = "https://${local.identity_v1_hostname}"
  identity_v1_docs_hostname = "docs.${local.identity_v1_hostname}"
  identity_v1_docs_endpoint = "https://${local.identity_v1_docs_hostname}"

  # Auth0
  auth0_hostname = "${trimspace(aws_ssm_parameter.hostname_prefix.value)}${data.aws_ssm_parameter.hostname.value}"
  auth0_endpoint = "https://${local.auth0_hostname}"

  # Wellcome Collection Site
  wellcome_collection_hostnames = {
    stage = "www-stage.wellcomecollection.org",
    prod  = "wellcomecollection.org"
  }
  wellcome_collection_site_uri = "https://${local.wellcome_collection_hostnames[terraform.workspace]}"

  # Account Management System
  ams_context_path         = "account"
  ams_redirect_uri         = "${local.wellcome_collection_site_uri}/${local.ams_context_path}/callback"
  ams_error_uri            = "${local.wellcome_collection_site_uri}/${local.ams_context_path}/error"
  ams_validate_uri         = "${local.wellcome_collection_site_uri}/${local.ams_context_path}/validated"
  ams_delete_requested_uri = "${local.wellcome_collection_site_uri}/${local.ams_context_path}/delete-requested"

  # Account Admin System
  account_admin_hostnames = {
    stage = "account-admin-stage.wellcomecollection.org"
    prod  = "account-admin.wellcomecollection.org"
  }
  aas_redirect_uri = "https://${local.account_admin_hostnames[terraform.workspace]}/api/auth/callback"
  aas_logout_uri   = "https://${local.account_admin_hostnames[terraform.workspace]}"

  # Identity account VPC
  identity_account_state = data.terraform_remote_state.accounts_identity.outputs
  vpc_id                 = local.identity_account_state["identity_vpc_id"]
  private_subnets        = local.identity_account_state["identity_vpc_private_subnets"]

  # ECS services
  elastic_cloud_vpce_sg_id = data.terraform_remote_state.infra_critical.outputs["ec_identity_privatelink_sg_id"]
  requests_lb_port         = 8000
  requests_repository      = data.terraform_remote_state.catalogue_api_shared.outputs["ecr_requests_repository_url"]
}
