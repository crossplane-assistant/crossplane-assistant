# Local cluster

In this section we will show you how to deploy a local cluster crossplane-assistant from the code.

## Prerequisites

In order to deploy the crossplane-assistant you need to have the following tools installed:

* [Docker](https://docs.docker.com/get-docker/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
* [Helm](https://helm.sh/docs/intro/install/)

## Deploy the cluster

```bash

# Build the docker images
make docker-ui
make docker-api

# Create the cluster
kind create cluster --name crossplane-assistant

NAMESPACE="crossplane-assistant"
KIND_CLUSTER_NAME="crossplane-assistant"

# Load the images in the cluster
kubectl create namespace $NAMESPACE

# Load local images in the cluster
kind load docker-image ldassonville/crossplane-assistant-api:latest --name $KIND_CLUSTER_NAME
kind load docker-image ldassonville/crossplane-assistant-ui:latest  --name $KIND_CLUSTER_NAME


# Install the crossplane-assistant
helm install crossplane-assistant \
  --create-namespace \
  --namespace $NAMESPACE \
  ./charts/crossplane-assistant

# Get the URL of the UI
kubectl port-forward svc/crossplane-assistant-ui 4200:8080 -n crossplane-assistant &
kubectl port-forward svc/crossplane-assistant-api 8080:8080 -n crossplane-assistant &
```
