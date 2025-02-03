# This image should be built with the parent directory as context
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /usr/src/app/webapp

ADD package.json package.json
ADD yarn.lock yarn.lock

RUN yarn install

ADD processorFunctions.js processorFunctions.js
ADD identityApi.yaml identityApi.yaml

CMD ["true"]
