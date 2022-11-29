provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn = var.provider_role_arn
  }

  default_tags {
    tags = local.common_tags
  }
}

provider "aws" {
  alias  = "aws_us-east-1"
  region = "us-east-1"

  assume_role {
    role_arn = var.provider_role_arn
  }

  default_tags {
    tags = local.common_tags
  }
}

provider "aws" {
  alias  = "experience"
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::130871440101:role/experience-developer"
  }

  default_tags {
    tags = local.common_tags
  }
}

provider "aws" {
  alias  = "dns"
  region = "eu-west-1"

  assume_role {
    role_arn = "arn:aws:iam::267269328833:role/wellcomecollection-assume_role_hosted_zone_update"
  }
}
