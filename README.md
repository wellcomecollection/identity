# identity

Identity services for Wellcome Collection users

[![Build status](https://badge.buildkite.com/965e1197af1ac22887636ef8cbd4b5bba98e7ab656e42fa574.svg?branch=main)](https://buildkite.com/wellcomecollection/identity)

## Developing

Developers should install https://pre-commit.com/, as the CI tests will run the checks present in [.pre-commit-config.yaml](https://github.com/wellcomecollection/identity/blob/main/.pre-commit-config.yaml).

### Terraform

This project uses [Terraform workspaces](https://www.terraform.io/docs/language/state/workspaces.html) to accomodate multiple environments.

You will need to switch workspace to plan/apply in a particular environment:

```
> terraform workspace list
* default
  prod
  stage

> terraform workspace select stage
Switched to workspace "stage".
```

### Continuous Integration

This project builds in Buildkite where there are pipelines to cover build and deployment through stage and production environments.

- [Identity](https://buildkite.com/wellcomecollection/identity): Test and build artifacts
- [Identity: Deploy Stage](https://buildkite.com/wellcomecollection/identity-deploy-stage): Deploy to staging environment and run smoke tests
- [Identity: Deploy Prod](https://buildkite.com/wellcomecollection/identity-deploy-prod): Deploy to production environment and run smoke tests

[![Build status](https://badge.buildkite.com/965e1197af1ac22887636ef8cbd4b5bba98e7ab656e42fa574.svg)](https://buildkite.com/wellcomecollection/identity)

Merged pull requests will be automatically deployed to the staging environment, but a production deploy requires manual unblocking in Buildkite.

#### Build images

The build uses a docker image generated from the `Dockerfile` in the `.buildkite` folder.

When this image is updated it is necessary to push this image to ECR manually.

```
# Log in to ECR via docker (you may need to use a different profile)
aws ecr get-login-password --region eu-west-1 --profile identity | docker login --username AWS --password-stdin 770700576653.dkr.ecr.eu-west-1.amazonaws.com

# Build the latest image
docker build . -t 770700576653.dkr.ecr.eu-west-1.amazonaws.com/uk.ac.wellcome/identity-build:latest

# Push the latest image
docker push 770700576653.dkr.ecr.eu-west-1.amazonaws.com/uk.ac.wellcome/identity-build:latest
```
