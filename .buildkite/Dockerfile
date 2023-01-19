FROM public.ecr.aws/docker/library/fedora:37

SHELL ["/bin/bash", "-ox", "pipefail", "-c"]

ARG A0DEPLOY_VERSION=7.12.2
RUN dnf -y install git zip unzip findutils python3 python3-pip jq tar xz which moreutils \
    && dnf -y module install nodejs:18/common \
    && dnf clean all \
    && rm -rf /var/cache/yum \
    && pip3 install awscli \
    && npm install --global auth0-deploy-cli@${A0DEPLOY_VERSION} yarn

ARG TERRAFORM_VERSION=1.3.6
ARG TERRAFORM_SHA256=bb44a4c2b0a832d49253b9034d8ccbd34f9feeb26eda71c665f6e7fa0861f49b
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

WORKDIR /app
