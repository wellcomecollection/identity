terraform {
  backend "s3" {
    assume_role = {
      role_arn = "arn:aws:iam::770700576653:role/identity-developer"
    }

    bucket         = "identity-remote-state"
    key            = "terraform.tfstate"
    dynamodb_table = "terraform-locktable"
    region         = "eu-west-1"
  }
}

data "aws_caller_identity" "current" {}
