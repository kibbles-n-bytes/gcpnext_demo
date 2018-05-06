#!/bin/bash

TOPICS="$(gcloud beta pubsub topics list | grep 'sb-' | sed 's/.*topics\/\(.*\)/\1/')"
TOPICS=($TOPICS)

CONFIGMAP_VALS=()

for idx in ${!TOPICS[*]}; do
  topic="${TOPICS[idx]}"
  subscription="store-${idx}"
  gcloud beta pubsub subscriptions delete ${subscription} &> /dev/null
  gcloud beta pubsub subscriptions create ${subscription} --topic ${topic}
  CONFIGMAP_VALS+="${topic} ${subscription} "
done

kubectl delete configmap pubsub-reader-config --ignore-not-found
kubectl create configmap pubsub-reader-config --from-literal=args="${CONFIGMAP_VALS}"
