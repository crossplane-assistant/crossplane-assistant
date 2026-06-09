IS_LINUX=$(shell sed --version > /dev/null 2> /dev/null && echo $$?)
ifeq ($(IS_LINUX),0)
	SED_IN_PLACE=-i
else
	SED_IN_PLACE=-i ""
endif


GITHASH := $(shell git rev-parse --short HEAD)
BUILDDATE := $(shell date -u +'%Y-%m-%dT%H:%M:%SZ')
MKFILE_PATH := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
CONTAINER_TOOL ?= docker
SHELL:=/bin/bash -e
IMG_FRONT ?= crossplane-assistant/crossplane-assistant-ui:latest
IMG_API ?= crossplane-assistant/crossplane-assistant-api:latest
IMG_UNIFIED ?= crossplane-assistant/crossplane-assistant:latest


.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: all
all: tidy deps build-binary

.PHONY: tidy
tidy: ## get the golang dependencies in the vendor folder
	GO111MODULE=on  go mod tidy

.PHONY: deps
deps: ## get the golang dependencies in the vendor folder
	GO111MODULE=on  go mod vendor

.PHONY: build-ui
build-ui: ## Build the Angular frontend
	cd $(MKFILE_PATH)/ui && npm ci && npm run build

.PHONY: build-binary
build-binary: build-ui ##  build the unified binary with embedded frontend
	go build -o crossplane-assistant -tags=jsoniter .
	chmod +x crossplane-assistant

# Legacy target for backwards compatibility
.PHONY: build-api
build-api: build-binary

.PHONY: dev
dev: ## Run in development mode (Angular dev server + Go API with CORS)
	@echo "Starting development mode..."
	@echo "Frontend: http://localhost:4200"
	@echo "Backend API: http://localhost:8080"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill 0' SIGINT; \
	cd $(MKFILE_PATH)/ui && npm install && ng serve & \
	go run -tags dev . & \
	wait

.PHONY: docker-binary
docker-binary: build-binary ## build the docker image for unified binary
	docker buildx build --platform=linux/amd64 --no-cache -t $(IMG_UNIFIED) -f ./build/unified/Dockerfile .

.PHONY: docker-unified
docker-unified: docker-binary ## Alias for docker-binary

.PHONY: docker-api
docker-api: build-api ## build the docker image for api (legacy)
	docker buildx build --platform=linux/amd64  --no-cache -t $(IMG_API) -f ./build/api/Dockerfile .

.PHONY: docker-ui
docker-ui: build-ui ## Build the docker image (legacy)
	@which docker || (echo 'ERROR: Missing docker ( apt-get install -y docker )' && false)
	$(CONTAINER_TOOL)  buildx build --platform=linux/amd64 -f ./build/front/Dockerfile -t ${IMG_FRONT} .

.PHONY: docker
docker: docker-ui docker-api ## Build docker image for UI and API (legacy)


.PHONY: fmt
fmt:
	find . -type f -name '*.go' -not -path "./vendor/*" -exec goimports -w  {} \;

.PHONY: pre-commit
pre-commit:  ## Run the pre-commit
	@pre-commit run --all-files
