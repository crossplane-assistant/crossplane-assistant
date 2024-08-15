<img alt="Crossplane-Assistant" src="./docs/assets/crossplane-assistant.svg" width="100px">

# Crossplane Assistant

Crossplane Assistant helps you developing CRDs and Compositions (correlation between objects) with Crossplane.

## Getting Started
$ helm upgrade …

## Features

- Check the XRD healthiness in the cluster
- Show the Composition in a graphical way
- Watch the Composite resource creation (a changer) and evolution in the cluster
- Highlight the unused XRD attributes
- Highlight the broken Fields in the Composition
- Pilot your resources (update and delete) directly on the Dashboard
- Show the dependency links between objects
- Validate and lint the Composition
- Dry run the Composite resource creation

## Web Interface

Watch the Composite resources

![Screenshot]()

Show Live composition in editor

![Screenshot]()

Show dependencies

![Screenshot]()

More screenshots are available in the [Documentation section Screenshots](#).

## Install

### Helm

To install Crossplane-assistant with helm, you can use the following command:

```bash
helm install crossplane-assistant \
    --create-namespace \
    --namespace crossplane-assistant \
    ./charts/crossplane-assistant
```


### Usage docker

Launch the API and UI as docker

```
docker run --name crossplane-assistant-api  -p 8080:8080 ldassonville/crossplane-assistant-api:latest
docker run --name crossplane-assistant-ui -p 4200:8080 crossplane-assistant-ui:latest
```
then go on [crossplane-assistant-ui](http://localhost:4200)

### Run in local

```bash
make docker front
make all-api
docker run -tid --name crossplane-assistant-ui -p 3000:8080 crossplane-assistant/crossplane-assistant-ui
./crossplane-assistant-api
```

Then go on [crossplane-assistant-ui](http://localhost:3000)


## Documentation

You can find the complete documentation at [Documentation](#).

## Getting Help

If you have any questions or feedback regarding Crossplane Assistant:

- Ask a question on the Crossplane Assistant Slack channel. To invite yourself to the Crossplane Assistant Slack, visit https://slack.crossplane-assistant.io and join the #crossplane-assistant-support channel.
- File an issue for bugs, issues and feature suggestions.

## Contributing

Help us evolving Crossplane Assistant. Here is the [Contributing Guide](#).

## License

Crossplane Assistant is released under AGPL-3.0-or-later and Commons Clause licenses.
