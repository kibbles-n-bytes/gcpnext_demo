#!/bin/bash

set -e

docker build . -t "gcr.io/sc-bookstore-demo/app:test"
gcloud docker -- push "gcr.io/sc-bookstore-demo/app:test"
