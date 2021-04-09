provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::770700576653:role/identity-ci"
  }
}

provider "aws" {
  alias  = "aws_us-east-1"
  region = "us-east-1"

  assume_role {
    role_arn = "arn:aws:iam::770700576653:role/identity-ci"
  }
}

provider "aws" {
  alias  = "experience"
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::130871440101:role/experience-developer"
  }
}
