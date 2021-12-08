FROM node:16-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        zip unzip python3 python3-pip jq tar xz-utils curl
RUN pip3 install awscli
RUN yarn global add auth0-deploy-cli@7.3.1

ARG TERRAFORM_VERSION=1.0.4
ARG TERRAFORM_SHA256=5c0be4d52de72143e2cd78e417ee2dd582ce229d73784fd19444445fa6e1335e
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin


WORKDIR /app
