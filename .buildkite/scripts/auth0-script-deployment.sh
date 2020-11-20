#!/bin/bash

rm -rf deploy/ auth0-export/
aws s3 cp s3://identity-dist/auth0-feat-lambda_authorizer.zip deploy/auth0-feat-lambda_authorizer.zip
unzip deploy/auth0-feat-lambda_authorizer.zip -d deploy/
a0deploy export --format directory --output_folder auth0-export/
cp -v deploy/get_user.js auth0-export/database-connections/Sierra-Connection/
cp -v deploy/login.js auth0-export/database-connections/Sierra-Connection/
a0deploy import --input_file auth0-export/
