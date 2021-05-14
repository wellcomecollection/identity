# This project uses "workspaces to distinguish environments
# See: https://www.terraform.io/docs/language/state/workspaces.html

terraform {
  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0.0" # Any non-beta version >= 2.0.0 and <2.1.0, i.e. 2.0.X
    }
    auth0 = {
      source  = "alexkappa/auth0"
      version = "~> 0.16.0" # Any non-beta version >= 0.16.0 and <0.17.0, i.e. 0.16.X
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.14.0" # Any non-beta version >= 3.14.0 and <3.15.0, i.e. 3.14.X
    }
    template = {
      source  = "hashicorp/template"
      version = "~> 2.2.0" # Any non-beta version >= 2.2.0 and <2.3.0, i.e. 2.2.X
    }
    external = {
      source  = "hashicorp/external"
      version = "~> 2.0.0" # Any non-beta version >= 2.0.0 and <2.1.0, i.e. 2.0.X
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0.0" # Any non-beta version >= 3.0.0 and <3.1.0, i.e. 3.0.X
    }
  }
}

data "terraform_remote_state" "infra_critical" {
  backend = "s3"

  config = {
    role_arn = "arn:aws:iam::760097843905:role/platform-read_only"

    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/platform-infrastructure/shared.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "catalogue_api_shared" {
  backend = "s3"

  config = {
    role_arn = "arn:aws:iam::756629837203:role/catalogue-read_only"

    bucket = "wellcomecollection-catalogue-infra-delta"
    key    = "terraform/catalogue/api/shared.tfstate"
    region = "eu-west-1"
  }
}
