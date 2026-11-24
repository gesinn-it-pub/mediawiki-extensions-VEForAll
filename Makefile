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

include build/Makefile
