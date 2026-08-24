.PHONY: install dev build start lint leads env help
.DEFAULT_GOAL := help

install:        ## Install dependencies
	npm install

dev:            ## Run the dev server
	npm run dev

build:          ## Production build
	npm run build

start:          ## Start the production server
	npm run start

lint:           ## Lint the codebase
	npm run lint

leads:          ## Run the data engine once from CLI (query + location)
	npx tsx scripts/run-leads.ts

env:            ## Copy .env.example -> .env.local
	cp .env.example .env.local

help:           ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
