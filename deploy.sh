#!/bin/bash

set -e

aws --profile=sai-dev2 \
    cloudformation update-stack \
    --stack-name=prowe-push-iot \
    --capabilities=CAPABILITY_IAM \
    --template-body=file://cloudformation.template.yaml
