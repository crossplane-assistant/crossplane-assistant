<img alt="Crossplane-Assistant" src="./docs/assets/plane-pilot-01.png" width="330px">

# Crossplane Assistant

Crossplane Assistant helps you developing CRDs and Compositions (correlation between objects) with Crossplane.

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

![Screenshot](./docs/assets/graph-capture.png)

Show Live composition in editor

Show dependencies

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

The unified binary serves both the API and the embedded frontend on port 8080 by default.

### Usage docker

Launch the unified binary as a Docker container:

```bash
docker run --name crossplane-assistant -p 8080:8080 ldassonville/crossplane-assistant:latest
```

Then go to [http://localhost:8080](http://localhost:8080)

The unified binary contains both the API and the Angular frontend. You can configure the port using the `PORT` environment variable:

```bash
docker run --name crossplane-assistant -p 9000:9000 -e PORT=9000 ldassonville/crossplane-assistant:latest
```

### Build and Run Locally

#### Production Build

Build the unified binary with embedded frontend:

```bash
make all
```

This will:
1. Build the Angular frontend (`npm ci && npm run build`)
2. Embed the frontend assets into the Go binary
3. Create a single `crossplane-assistant` executable

Run the binary:

```bash
./crossplane-assistant
```

Then go to [http://localhost:8080](http://localhost:8080)

To use a different port:

```bash
PORT=9000 ./crossplane-assistant
```

#### Development Workflow

For faster development with live reload, you can run both servers with a single command:

```bash
make dev
```

This will start:
- Angular dev server on [http://localhost:4200](http://localhost:4200) (with live reload)
- Go API on port 8080 (with CORS enabled for cross-origin requests)

Press Ctrl+C to stop both servers.

**Manual setup (alternative):**

If you prefer to run them separately in different terminals:

1. Start the Angular dev server (with live reload):
```bash
cd ui
npm install
ng serve
```

2. In a separate terminal, run the Go API in dev mode (with CORS enabled):
```bash
go run -tags dev .
```

The Angular dev server runs on [http://localhost:4200](http://localhost:4200) and proxies API requests to the backend on port 8080.


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
