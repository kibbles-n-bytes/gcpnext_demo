#!/bin/bash

docker build . -t "gcr.io/sc-bookstore-demo/app:test"
gcloud docker -a
docker push "gcr.io/sc-bookstore-demo/app:test"
