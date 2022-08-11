# This isn't strictly required by the module, but we add it here to
# make sure we remember to document these responses properly.
variable "label" {
  type = string
}

variable "path_part" {
  type = string
}

variable "responses" {
  default = {}
  type    = map(list(string))
}

variable "request_validator_id" {
  type    = string
  default = ""
}

variable "authorizer_id" {
  type    = string
  default = ""
}

variable "rest_api_id" {
  type = string
}

variable "parent_id" {
  type = string
}
