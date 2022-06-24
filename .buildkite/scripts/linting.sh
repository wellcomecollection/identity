#!/usr/bin/env bash
set -o errexit

yarn global add lint-staged prettier
lint-staged --diff="main..$BUILDKITE_BRANCH"

# Fail if any changes were made by linter
[[ -n $(git status -s) ]]

__run_pre_commit
