terraform {
  required_version = "= 0.14.2" # Pin to a specific version to avoid accidental upgrading of the statefile

  backend "s3" {
    role_arn = "arn:aws:iam::770700576653:role/identity-ci"
    bucket   = "identity-remote-state"
    key      = "terraform.tfstate"
    region   = "eu-west-1"
  }
}

data "aws_caller_identity" "current" {}

data "terraform_remote_state" "infra_shared" {
  backend = "s3"

  config = {
    role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    bucket   = "wellcomecollection-platform-infra"
    key      = "terraform/platform-infrastructure/shared.tfstate"
    region   = "eu-west-1"
  }
}
