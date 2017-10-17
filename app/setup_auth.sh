#!/bin/bash

set -eu

echo "Using GCP project: ${GCP_PROJECT}"
echo "Using service account: ${SERVICE_ACCOUNT_ID}"

NEW_UUID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
DIR="/tmp/sc-bookstore-demo${NEW_UUID}"

echo "Making directory ${DIR}"
mkdir ${DIR}

echo "Creating key to service account ${SERVICE_ACCOUNT_ID} in ${DIR}"
gcloud iam service-accounts keys create ${DIR}/key.json \
          --iam-account ${SERVICE_ACCOUNT_ID}@${GCP_PROJECT}.iam.gserviceaccount.com

SECRET_NAME="${SECRET_NAME:-"pubsub-key"}"
echo "Creating secret ${SECRET_NAME}"
kubectl create secret generic ${SECRET_NAME} --from-file=key.json="${DIR}/key.json"
