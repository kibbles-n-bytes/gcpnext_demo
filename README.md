# Running the demo

## Deploy the service catalog

```
export REGISTRY=gcr.io/kibbegcpnext-demo
export VERSION=gcpnext

helm install \
    --set "registry=${REGISTRY},version=${VERSION}" \
    --namespace catalog \
    ../deploy/catalog
```

## Add gcp broker

```
kubectl create -f demo/gcp-broker.yaml
```

## Add k8s broker

```
kubectl create -f demo/k8s-broker.yaml
```

## Create user service

```
kubectl create -f demo/users-instance.yaml
kubectl create -f demo/users-bindings.yaml
```

## Create inventory service

```
kubectl create -f demo/inventory-instance.yaml
kubectl create -f demo/inventory-bindings.yaml
```

## Deploy purchase service

This is service will consume both user and bookstore bindings.

```
kubectl create -f demo/purchases-instance.yaml
kubectl create -f demo/purchases-binding.yaml
```

## Deploy PubSub service
```
kubectl create -f demo/pubsub-instance.yaml
kubectl create -f demo/pubsub-binding.yaml
```

## Deploy app

```
helm install --set "version=${VERSION}" app/app
```

## Make a purchase

Get the app public IP.

```
kubectl get services app
export IP=<IP>
```

Make a purchase.

```
curl -H "Content-Type: application/json" \
    -X POST \
    -d '{"user": "/users/1", "book": "/shelves/1/books/2"}' \
    ${IP}:8080/purchases
```

Check on your purchase.

```
curl ${IP}:8080/purchases
```
