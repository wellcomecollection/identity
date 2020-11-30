FROM registry.access.redhat.com/ubi8/ubi-minimal:8.3
LABEL maintainer="Daniel Grant <daniel.grant@digirati.com>"

SHELL ["/bin/bash", "-ox", "pipefail", "-c"]

RUN microdnf install git zip unzip findutils python3 python3-pip npm jq tar xz which \
    && pip3 install pre-commit awscli \
    && npm install --global auth0-deploy-cli yarn

ARG TERRAFORM_VERSION=0.13.5
ARG TERRAFORM_SHA256=f7b7a7b1bfbf5d78151cfe3d1d463140b5fd6a354e71a7de2b5644e652ca5147
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

ARG SHELLCHECK_VERSION=0.7.1
ARG SHELLCHECK_SHA256=64f17152d96d7ec261ad3086ed42d18232fcb65148b44571b564d688269d36c8
RUN curl -L https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz -o /tmp/shellcheck.tar.xz \
    && echo "${SHELLCHECK_SHA256} /tmp/shellcheck.tar.xz" | sha256sum -c - \
    && tar xvf /tmp/shellcheck.tar.xz --strip-components 1 -C /usr/local/bin

WORKDIR /app
