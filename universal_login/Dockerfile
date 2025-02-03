FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /usr/src/app/webapp

ADD . /usr/src/app/webapp

ENV AWS_REGION eu-west-1

RUN yarn

CMD ["true"]
