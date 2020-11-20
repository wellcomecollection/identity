FROM registry.access.redhat.com/ubi8/ubi-minimal:8.3
LABEL maintainer="Daniel Grant <daniel.grant@digirati.com>"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN sh -c 'echo -e "[buildkite-agent]\nname = Buildkite Pty Ltd\nbaseurl = https://yum.buildkite.com/buildkite-agent/stable/x86_64/\nenabled=1\ngpgcheck=0\npriority=1" > /etc/yum.repos.d/buildkite-agent.repo' \
    && microdnf install git zip unzip findutils python3 python3-pip npm buildkite-agent \
    && pip3 install pre-commit awscli \
    && npm install --global auth0-deploy-cli yarn

ARG TERRAFORM_VERSION=0.13.5
ARG TERRAFORM_SHA256=f7b7a7b1bfbf5d78151cfe3d1d463140b5fd6a354e71a7de2b5644e652ca5147
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

WORKDIR /app
