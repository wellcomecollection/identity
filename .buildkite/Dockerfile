FROM fedora:33
LABEL maintainer="Daniel Grant <daniel.grant@digirati.com>"

SHELL ["/bin/bash", "-ox", "pipefail", "-c"]

RUN dnf -y install git zip unzip findutils python3 python3-pip npm jq tar xz which \
    && dnf clean all \
    && rm -rf /var/cache/yum \
    && pip3 install pre-commit awscli \
    && npm install --global auth0-deploy-cli@6.0.0 yarn

ARG TERRAFORM_VERSION=0.14.2
ARG TERRAFORM_SHA256=6f380c0c7a846f9e0aedb98a2073d2cbd7d1e2dc0e070273f9325f1b69e668b2
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

ARG SHELLCHECK_VERSION=0.7.1
ARG SHELLCHECK_SHA256=64f17152d96d7ec261ad3086ed42d18232fcb65148b44571b564d688269d36c8
RUN curl -L https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.linux.x86_64.tar.xz -o /tmp/shellcheck.tar.xz \
    && echo "${SHELLCHECK_SHA256} /tmp/shellcheck.tar.xz" | sha256sum -c - \
    && tar xvf /tmp/shellcheck.tar.xz --strip-components 1 -C /usr/local/bin

WORKDIR /app
