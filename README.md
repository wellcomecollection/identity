# identity

[![Build status](https://badge.buildkite.com/965e1197af1ac22887636ef8cbd4b5bba98e7ab656e42fa574.svg?branch=main)](https://buildkite.com/wellcomecollection/identity)

This repo contains identity-related services for Wellcome Collection users.
This allows users to sign in on wellcomecollection.org and keeps their personal information safe.



## Architecture

```mermaid
flowchart LR
    W[identity web app] --> IA[API authorizer]
    IA --> I_API[items API]
    IA --> R_API[requests API]
    IA --> API[identity API]
    API --> A0[(Auth0)]
    API --> SI[(Sierra)]
    I_API --> SI
    R_API --> SI
    A0 --> SI

    classDef externalNode fill:#e8e8e8,stroke:#8f8f8f
    class W,I_API,R_API externalNode

    classDef repoNode fill:#c8ecee,stroke:#298187,stroke-width:2px
    class IA,API,A0,SI repoNode
```

The canonical store of user information is **Sierra**, our library management system.

We put **Auth0** in front of Sierra to act as a modern identity provider where we require authentication and authorization. Some of our code runs inside Auth0 in the form of **Custom DB Scripts** to interface with Sierra, or as **Actions** to augment its default behaviour.

We provide the **Identity API** for other services (like the identity webapp in the [wellcomecollection.org repo](https://github.com/wellcomecollection/wellcomecollection.org)) to be able to retrieve and mutate the data in Sierra. This is a TypesScript Lambda.

The **API authorizer** is another TypeScript Lambda within API Gateway that checks (a) the validity of access tokens (from Auth0) to _authenticate_ the user and (b) that they are able to operate on the requested resource (usually themselves) to _authorize_ them. It also protects the **Items API** and **Requests API**, which are used to manage items which users have [requested from library stores][stores]. These APIs are defined in the [catalogue-api repo][api]. 

Users experience these services/APIs through the **identity web app**, which is defined in the [wellcomecollection.org repo](https://github.com/wellcomecollection/wellcomecollection.org).

In the terminology of the OAuth 2.0 [specification](https://datatracker.ietf.org/doc/html/rfc6749), the primary **resource owner** is the identity web app, the 3 APIs combined with the authorizer constitute the **resource server**, and Auth0 functions as the **authorization server**. We use the [Authorization Code Grant](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow).

[stores]: https://wellcomecollection.org/pages/X_2eexEAACQAZLBi
[api]: https://github.com/wellcomecollection/catalogue-api

### Login flow
The sequence of requests/actions between different entities for a login followed by an action is as follows:
```mermaid
sequenceDiagram
    participant User
    participant ID_APP as Identity Webapp
    participant A0_LOGIN as Auth0 Universal Login Screen
    participant A0_TENANT as Auth0 Tenant
    participant Sierra
    participant ID_AUTH as Identity Authorizer
    participant RESOURCE_APIS as Identity/Items/Requests APIs

    User->>ID_APP: Click login
    note right of ID_APP: Performed by Auth0 SDK
    ID_APP->>A0_LOGIN: Redirect
    A0_LOGIN->>A0_TENANT: Login request

    rect rgb(240, 240, 240)
        note over A0_TENANT, Sierra: Custom DB scripts
        A0_TENANT->>Sierra: Validate credentials
        Sierra->>Sierra: Credentials are correct
        Sierra->>A0_TENANT: User authenticated
    end

    rect rgb(240, 240, 240)
        note right of ID_APP: Webapp side performed by Auth0 SDK
        A0_TENANT->>ID_APP: Authorization code
        ID_APP->>A0_TENANT: Code and application credentials
        rect rgb(230, 230, 230)
            note right of A0_TENANT: Auth0 Actions
            A0_TENANT->>A0_TENANT: Add custom claims to tokens
        end
        A0_TENANT->>ID_APP: ID, access, and refresh tokens
        ID_APP->>ID_APP: Tokens stored in session cookie (HttpOnly)
    end

    User->>ID_APP: Request to /account/api/*
    ID_APP->>ID_AUTH: Proxied request with access token added from session cookie
    ID_AUTH->>ID_AUTH: Verify token is valid and signed by Auth0
    ID_AUTH->>RESOURCE_APIS: Authorized request
    RESOURCE_APIS->>Sierra: Modify user or create hold request
    Sierra->>RESOURCE_APIS: Sierra response
    RESOURCE_APIS->>User: API response
```

## Developing

Installing the project dependencies (ie `yarn` at the root) will also set up [lint-staged](https://github.com/okonet/lint-staged) to run [prettier](https://prettier.io/) as a pre-commit hook. This formatting is also checked in CI. You might also want to [set up your editor](https://prettier.io/docs/en/editors.html) to run prettier on save!

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

[![Build status](https://badge.buildkite.com/965e1197af1ac22887636ef8cbd4b5bba98e7ab656e42fa574.svg?branch=main)](https://buildkite.com/wellcomecollection/identity)

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
