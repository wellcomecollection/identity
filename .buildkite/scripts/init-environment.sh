#!/bin/bash

cd infra/scoped && terraform init && terraform workspace select stage
terraform output -json -no-color | jq -r .ci_environment_variables.value[] > env.sh
chmod +x env.sh && source env.sh && rm env.sh
