#!/bin/bash
########################################################
# Script name : ams-packaging.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

function __authenticate_ecr() {
  eval "$(aws ecr get-login --no-include-email)"
}

function __build_image() {
  docker build -f packages/account-management/Dockerfile -t identity-account-management-system packages/account-management/
}

function __tag_image() {
  docker tag identity-account-management-system:latest "770700576653.dkr.ecr.eu-west-1.amazonaws.com/identity-account-management-system:${NORMALIZED_BRANCH_NAME}"
}

function __push_image() {
  docker push "770700576653.dkr.ecr.eu-west-1.amazonaws.com/identity-account-management-system:${NORMALIZED_BRANCH_NAME}"
}

__authenticate_ecr
__build_image
__tag_image
__push_image
