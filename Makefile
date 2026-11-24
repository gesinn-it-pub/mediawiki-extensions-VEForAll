-include .env
export

# setup for docker-compose-ci build directory
# delete "build" directory to update docker-compose-ci

ifeq (,$(wildcard ./build/))
    $(shell git submodule update --init --remote)
endif

EXTENSION = VEForAll

# docker images
MW_VERSION    ?= 1.43
PHP_VERSION   ?= 8.3
DB_TYPE       ?= mysql
DB_IMAGE      ?= "mariadb:12.3"

# extensions
PF_REPO       ?= gesinn-it/mediawiki-extensions-PageForms
PF_VERSION    ?= 2.5.1

# composer
COMPOSER_EXT  ?= true

# nodejs
NODE_JS       ?= true

# browser tests
# Installs Playwright and Chromium for the browser test (tests/browser/smoke.js). Off by default:
# "make install" rebuilds the image without cache, so Chromium would be downloaded on every local
# install. The Dockerfile installs it for any non-empty value (also "false"), so keep it empty.
# Set BROWSER_TESTS=true (or in .env) to run "make browser-test" locally.
BROWSER_TESTS ?=

include build/Makefile

.PHONY: browser-test
browser-test: .init
	$(show-current-target)
	$(compose-exec-wiki) bash -c "cd $(EXTENSION_FOLDER) && node tests/browser/smoke.js"
