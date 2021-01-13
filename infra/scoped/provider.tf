terraform {
  required_providers {
    archive = {
      source = "hashicorp/archive"
    }
    auth0 = {
      source = "alexkappa/auth0"
    }
    aws = {
      source = "hashicorp/aws"
    }
    template = {
      source = "hashicorp/template"
    }
    external = {
      source = "hashicorp/external"
    }
    random = {
      source = "hashicorp/random"
    }
  }
}

provider "aws" {
  version = "~> 3.14.0" # Any non-beta version >= 3.14.0 and <3.15.0, i.e. 3.14.X
  region  = "eu-west-1"
}

provider "aws" {
  alias   = "aws_us-east-1"
  version = "~> 3.14.0" # Any non-beta version >= 3.14.0 and <3.15.0, i.e. 3.14.X
  region  = "us-east-1"
}

provider "template" {
  version = "~> 2.2.0" # Any non-beta version >= 2.2.0 and <2.3.0, i.e. 2.2.X
}

provider "archive" {
  version = "~> 2.0.0" # Any non-beta version >= 2.0.0 and <2.1.0, i.e. 2.0.X
}

provider "auth0" {
  version = "~> 0.16.0" # Any non-beta version >= 0.16.0 and <0.17.0, i.e. 0.16.X
}

provider "external" {
  version = "~> 2.0.0" # Any non-beta version >= 2.0.0 and <2.1.0, i.e. 2.0.X
}

provider "random" {
  version = "~> 3.0.0" # Any non-beta version >= 3.0.0 and <3.1.0, i.e. 3.0.X
}
