#!/bin/bash

docker build . -t "gcr.io/kibbe-plori/app:latest"
gcloud docker -a
docker push "gcr.io/kibbe-plori/app:latest"
