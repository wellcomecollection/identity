provider "aws" {
  version = "~> 3.14.0" # Any non-beta version >= 3.14.0 and <3.15.0, i.e. 3.14.X
  region  = "eu-west-1"
}

provider "template" {
  version = "~> 2.2.0" # Any non-beta version >= 2.2.0 and <2.3.0, i.e. 2.2.X
}

provider "archive" {
  version = "~> 2.0.0" # Any non-beta version >= 2.0.0 and <2.1.0, i.e. 2.0.X
}
