# This project uses "workspaces to distinguish environments
# See: https://www.terraform.io/docs/language/state/workspaces.html

terraform {
  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = ">= 2.0.0"
    }
    auth0 = {
      source  = "auth0/auth0"
      version = "~> 0.30.3"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.34.0"
    }
    external = {
      source  = "hashicorp/external"
      version = ">= 2.0.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.0.0"
    }
  }
}

data "terraform_remote_state" "identity_static" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::770700576653:role/identity-developer"
    }

    bucket = "identity-static-remote-state"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "infra_critical" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    }

    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/platform-infrastructure/shared.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "catalogue_api_shared" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::756629837203:role/catalogue-read_only"
    }

    bucket = "wellcomecollection-catalogue-infra-delta"
    key    = "terraform/catalogue/api/shared.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "accounts_identity" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    }

    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/aws-account-infrastructure/identity.tfstate"
    region = "eu-west-1"
  }
}

data "terraform_remote_state" "monitoring" {
  backend = "s3"

  config = {
    assume_role = {
      role_arn = "arn:aws:iam::760097843905:role/platform-read_only"
    }
    bucket = "wellcomecollection-platform-infra"
    key    = "terraform/monitoring.tfstate"
    region = "eu-west-1"
  }
}
