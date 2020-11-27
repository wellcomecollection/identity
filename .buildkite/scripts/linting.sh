#!/bin/bash
########################################################
# Script name : linting.sh
# Author      : Daniel Grant <daniel.grant@digirati.com>
########################################################

set -o errexit

__run_pre_commit() {
  pre-commit run --all-files --verbose
}

__run_pre_commit
