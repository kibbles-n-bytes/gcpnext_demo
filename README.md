# Service Catalog and GCP Broker Demo

## Prereqs

- Installed and in your PATH:
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

## Installing the app

Install the main "Books! Books! Books!" web app:

```
kubectl apply -f setup/
```

The bookstore will now be deployed to your cluster, but the `booksfe` pod will
not start running until the Pub/Sub instance and binding have been created.

## Connecting the demo app with Google Cloud Pub/Sub
Now we're going to connect this app to Google Cloud Pub/Sub to see when
purchases are made. When you buy a book, the app will publish a message to the
topic created by the binding.

### Installation:

#### Google Cloud Pub/Sub Service Instance:
Let's hook our application into Pub/Sub.

Create the Pub/Sub instance:
```
kubectl create -f demo/instance.yaml
```

Create the Pub/Sub binding:
```
kubectl create -f demo/binding.yaml
```

You may also use the Service Catalog CLI `svcat` to provision and bind. This is
out of the scope of this tutorial.

### Using the app

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

To view messages published by the app:

```
gcloud pubsub subscriptions pull pubsub-sub --auto-ack
```

You should see messages appear that correspond to those purchases.
