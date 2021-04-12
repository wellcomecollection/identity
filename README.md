# identity

Identity services for Wellcome Collection users

[![Build status](https://badge.buildkite.com/965e1197af1ac22887636ef8cbd4b5bba98e7ab656e42fa574.svg?branch=main)](https://buildkite.com/wellcomecollection/identity)

## Developing

Developers should install https://pre-commit.com/, as the CI tests will run the checks present in [.pre-commit-config.yaml](https://github.com/wellcomecollection/identity/blob/main/.pre-commit-config.yaml).

### Terraform

This project is pinned at version `0.14.2`. You will need to download [that specific version](https://releases.hashicorp.com/terraform/0.14.2/) for your platform.

This project uses [Terraform workspaces](https://www.terraform.io/docs/language/state/workspaces.html) to accomodate mulitple environments.

You will need to switch workspace to plan/apply in a particular environment:

```
> terraform workspace list
* default
  prod
  stage

> terraform workspace select stage
Switched to workspace "stage".
```
