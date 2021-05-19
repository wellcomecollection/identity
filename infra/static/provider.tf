terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.41.0" # Any non-beta version >= 3.41.0 and <3.42.0, i.e. 3.41.X
    }
  }
}

provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::770700576653:role/identity-developer"
  }
}
