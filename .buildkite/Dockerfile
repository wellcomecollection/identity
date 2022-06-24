FROM public.ecr.aws/docker/library/fedora:33

SHELL ["/bin/bash", "-ox", "pipefail", "-c"]

ARG A0DEPLOY_VERSION=7.12.2
RUN dnf -y install git zip unzip findutils python3 python3-pip npm jq tar xz which moreutils \
    && dnf clean all \
    && rm -rf /var/cache/yum \
    && pip3 install awscli \
    && npm install --global auth0-deploy-cli@${A0DEPLOY_VERSION} yarn

ARG TERRAFORM_VERSION=1.0.4
ARG TERRAFORM_SHA256=5c0be4d52de72143e2cd78e417ee2dd582ce229d73784fd19444445fa6e1335e
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

WORKDIR /app
