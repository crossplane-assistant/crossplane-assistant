config=$1
# your server name goes here
server=$(cat  $HOME/.kube/config | yq  ".clusters[] | select(.name == \"$config\") | .cluster.server")

# the name of the secret containing the service account token goes here
name=crossplane-assistant-api-secret
sa=kas-crossplane-assistant-api
namespace=crossplane-assistant
clusterrolebinding=crossplane-assistant-binding

# create the service account in the namespace
kubectl get ns $namespace || kubectl create ns $namespace
kubectl get sa $sa -n $namespace || kubectl create sa $sa -n $namespace

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ${name}
  namespace: ${namespace}
  annotations:
    kubernetes.io/service-account.name: ${sa}
type: kubernetes.io/service-account-token
EOF


ca=$(kubectl get secret/$name -o jsonpath='{.data.ca\.crt}' -n $namespace)
token=$(kubectl get secret/$name -o jsonpath='{.data.token}' -n $namespace| base64 --decode)
namespace=$(kubectl get secret/$name -o jsonpath='{.data.namespace}' -n $namespace | base64 --decode)


# kubectl get sa kas-crossplane-assistant-api  -n  crossplane-assistant -o yaml
kubectl get clusterrolebinding ${clusterrolebinding} || kubectl create clusterrolebinding ${clusterrolebinding} --clusterrole=cluster-admin --serviceaccount=${namespace}:${sa}

echo "
apiVersion: v1
kind: Config
clusters:
- name: default-cluster
  cluster:
    certificate-authority-data: ${ca}
    server: ${server}
contexts:
- name: default-context
  context:
    cluster: default-cluster
    namespace: default
    user: default-user
current-context: default-context
users:
- name: default-user
  user:
    token: ${token}
" >  $HOME/.kube/crossplane-assistant-config
