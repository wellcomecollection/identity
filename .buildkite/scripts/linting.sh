#!/usr/bin/env bash
set -o errexit

yarn lint-staged --diff="main..$BUILDKITE_BRANCH"

# Fail if any changes were made
[[ -n $(git status -s) ]]

__run_pre_commit
