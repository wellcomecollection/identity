FROM public.ecr.aws/docker/library/node:18

SHELL ["/bin/bash", "-ox", "pipefail", "-c"]

ARG A0DEPLOY_VERSION=7.12.2
RUN apt-get update && \
    apt-get install -y zip findutils python3 python3-pip jq moreutils && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install awscli --break-system-packages && \
    yarn global add auth0-deploy-cli@${A0DEPLOY_VERSION}

ARG TERRAFORM_VERSION=1.9.8
ARG TERRAFORM_SHA256=186e0145f5e5f2eb97cbd785bc78f21bae4ef15119349f6ad4fa535b83b10df8
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && echo "${TERRAFORM_SHA256} /tmp/terraform.zip" | sha256sum -c - \
    && unzip /tmp/terraform.zip -d /usr/local/bin

WORKDIR /app
