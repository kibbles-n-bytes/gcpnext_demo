#!/bin/bash

TOPICS="$(gcloud beta pubsub topics list | grep 'sb-' | sed 's/.*topics\/\(.*\)/\1/')"
TOPICS=($TOPICS)

CONFIGMAP_VALS=()

for idx in ${!TOPICS[*]}; do
  topic="${TOPICS[idx]}"
  gcloud beta pubsub subscriptions delete "bookstore-demo-${idx}"
  gcloud beta pubsub subscriptions create "bookstore-demo-${idx}" --topic ${topic}
  CONFIGMAP_VALS+="${topic} bookstore-demo-${idx} "
done

kubectl delete configmap pubsub-reader-config
kubectl create configmap pubsub-reader-config --from-literal=args="${CONFIGMAP_VALS}"
