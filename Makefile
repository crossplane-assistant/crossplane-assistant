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


.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: all-api
all: tidy deps build-api

.PHONY: tidy
tidy: ## get the golang dependencies in the vendor folder
	GO111MODULE=on  go mod tidy

.PHONY: deps
deps: ## get the golang dependencies in the vendor folder
	GO111MODULE=on  go mod vendor


.PHONY: build-api
build-api: ##  build the executable and set the version
	go build -o crossplane-assistant-api -tags=jsoniter ./cmd/api
	chmod +x crossplane-assistant-api

.PHONY: docker-api
docker-api: build-api ## build the docker image for api
	docker buildx build --platform=linux/amd64  --no-cache -t $(IMG_API) -f ./build/api/Dockerfile .


.PHONY: clean-ui
clean-ui:
	rm -rf node_modules
	rm -rf dist
	rm -rf coverage


.PHONY: check-ui
check-ui : ## Check binary requirements are met.
	@which node || (echo 'ERROR: Missing nodejs ( node 6 required, install from https://github.com/creationix/nvm or https://nodejs.org )' && false)
	@which ng || (echo 'ERROR: Missing angular cli ( npm install -g @angular/cli )' && false)

.PHONY: init-ui
init-ui: check-ui
	cd $(MKFILE_PATH)/ui  && npm install

.PHONY: build-ui
build-ui: init-ui ##  build the font end
	cd $(MKFILE_PATH)/ui && npm run build


.PHONY: docker-ui
docker-ui: build-ui ## Build the docker image
	@which docker || (echo 'ERROR: Missing docker ( apt-get install -y docker )' && false)
	$(CONTAINER_TOOL)  buildx build --platform=linux/amd64 -f ./build/front/Dockerfile -t ${IMG_FRONT} .

.PHONY: docker
docker: docker-ui docker-api ## Build docker image for UI and API


.PHONY: fmt
fmt:
	find . -type f -name '*.go' -not -path "./vendor/*" -exec goimports -w  {} \;

.PHONY: pre-commit
pre-commit:  ## Run the pre-commit
	@pre-commit run --all-files
