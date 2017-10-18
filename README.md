# Service Catalog and GCP Broker Demo

## Prereqs

- Installed and in your PATH:
  - [Helm](https://github.com/kubernetes/helm)
  - `gcloud`
  - `kubectl`

- You are logged in with `gcloud`. If not, run the following and follow the
  instructions:
  ```
  gcloud auth login
  ```

- Your default `gcloud` project is set to the project you intend to use for this
demo. To do so, run the following:
  ```
  gcloud config set project ${YOUR-PROJECT-HERE}
  ```

## Deploy the Service Catalog and GCP Broker

To install the Service Catalog in your cluster and connect with the GCP Broker,
you should follow the instructions in the
GoogleCloudPlatform/k8s-service-catalog project
[here](https://github.com/GoogleCloudPlatform/k8s-service-catalog).

## K8S Broker

This project uses a custom build of the
[Helm Broker](https://github.com/google/helm-broker) to install demo-specific
service instances in your cluster.

Create the actual broker resources in Kubernetes:

```
kubectl create -f k8s_broker/k8s-broker.yaml
```

Connect the K8S Broker to the Service Catalog:

```
kubectl create -f demo/k8s-broker.yaml
```

## Creating Instances and Bindings

Create the instances and bindings used in the demo:

```
kubectl create -f demo/demo-setup-instances.yaml
kubectl create -f demo-setup-purchases-bindings.yaml
kubectl create -f demo-setup-app-bindings.yaml
```

## Installing the app

Install the main "Books! Books! Books!" web app:

```
helm install app/app --name app
```

Access the app:

1) Find the external IP for the app
```
kubectl get services booksfe
APP_IP=XXX.XXX.XX.XX # Use the IP listed under the EXTERNAL-IP column
```

2) Visit the app in your browser at: http://${APP_IP}:8080/

You should see a list of eight books with a button that says "Purchase" beside
each. If you click "Purchase", that book will be added to your list of
Purchases, which you can view by clicking the tab at the top.

## Connecting the demo app with Google Cloud Pub/Sub
Now we're going to connect this app to Google Cloud Pub/Sub to see when
purchases are made. In this new version, when you buy a book, the app
will publish a message to the topic created by the binding. It will also
create a subscription for convenience called "sc-bookstore-demo", should it
not already exist.

### Prereqs:
To connect your application to Pub/Sub, you should create a service account
named "sc-bookstore-demo" in your GCP project. To easily do this, run the
following command:

```
gcloud iam service-accounts create sc-bookstore-demo --display-name "Service account for Service Catalog Bookstore demo"
```

In order for your application to use the service account you created, you will
need to create a secret containing a key to that service account. To do so
easily, run the following script:

```
./scripts/setup-service-account-key.sh
```

### Installation:
Create the Pub/Sub instance:
```
kubectl create -f demo/gcp-pubsub-instance.yaml
```

Next, edit the Pub/Sub binding YAML file to point to the service account you
created for this demo. You should replace "${YOUR-PROJECT-HERE}" with your
project's ID (name, not number).

Create the Pub/Sub binding:
```
kubectl create -f demo/gcp-pubsub-binding.yaml
```


Now, redeploy the application, this time telling it to use Pub/Sub:

```
helm upgrade app app/app --set "usePubsub=true"
```

### Using the app

To view messages published by the app, you can run the following command to pull
the latest message from the message queue (you may have to run it a few times
before it sees the message):

```
gcloud beta pubsub subscriptions pull sc-bookstore-demo --auto-ack
```
