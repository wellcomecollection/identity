terraform {
  backend "s3" {
    role_arn = "arn:aws:iam::770700576653:role/identity-developer"

    bucket         = "identity-static-remote-state"
    key            = "terraform.tfstate"
    dynamodb_table = "terraform-locktable"
    region         = "eu-west-1"
  }
}
