#!/bin/bash

set -eu

echo "Using GCP project: ${GCP_PROJECT}"

SERVICE_ACCOUNT_NAME="${SERVICE_ACCOUNT_NAME:-"demo-pubsub-reader"}"
SECRET_NAME="${SECRET_NAME:-"pubsub-reader-key"}"
echo "Using service account: ${SERVICE_ACCOUNT_NAME:-"demo-pubsub-reader"}"
echo "Using secret name: ${SECRET_NAME}"

NEW_UUID=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
DIR="/tmp/pubsub-reader${NEW_UUID}"

echo "Making directory ${DIR}"
mkdir ${DIR}

echo "Creating key to service account ${SERVICE_ACCOUNT_NAME} in ${DIR}"
ACCOUNT=${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT}.iam.gserviceaccount.com
gcloud iam service-accounts keys create ${DIR}/key.json \
  --iam-account ${ACCOUNT}

echo "Granting OWNER role to service account"
gcloud projects add-iam-policy-binding ${GCP_PROJECT} \
  --member serviceAccount:${ACCOUNT} \
  --role roles/owner

echo "Creating secret ${SECRET_NAME}"
kubectl delete secret ${SECRET_NAME} || true
kubectl create secret generic ${SECRET_NAME} --from-file=key.json="${DIR}/key.json"
