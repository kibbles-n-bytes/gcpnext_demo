#!/bin/bash

kubectl delete servicebrokers,deployments,services,pods,serviceclasses,servicebindings,serviceinstances,secrets,configmaps --all
helm list | grep -v catalog-0.0 | grep -v NAME | awk '{print $1}'  | xargs helm delete
