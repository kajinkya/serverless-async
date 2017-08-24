#!/bin/bash

set -e

aws cloudformation update-stack \
    --stack-name=prowe-push-iot \
    --capabilities=CAPABILITY_IAM \
    --template-body=file://cloudformation.template.yaml
