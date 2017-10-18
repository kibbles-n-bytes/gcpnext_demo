#!/bin/bash

helm install app/ --set "version=test" --name "app"
