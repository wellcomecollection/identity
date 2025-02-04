#!/usr/bin/env bash
set -o errexit

# Versions should match package.json
yarn global add lint-staged@13.0.2 prettier@2.2.1
lint-staged --diff="main..$BUILDKITE_BRANCH"

# Fail if any changes were made by linter
git config --global --add safe.directory /app
git diff --cached --exit-code
