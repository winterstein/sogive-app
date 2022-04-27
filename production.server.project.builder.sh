#!/bin/bash
/home/winterwell/config/build-scripts/builder.sh \
BUILD_TYPE="production" \
PROJECT_NAME="sogive-app" \
NAME_OF_SERVICE="sogive" \
GIT_REPO_URL="github.com:/winterstein/sogive-app" \
PROJECT_ROOT_ON_SERVER="/home/winterwell/sogive-app" \
PROJECT_USES_BOB="yes" \
PROJECT_USES_NPM="yes" \
PROJECT_USES_WEBPACK="yes" \
PROJECT_USES_JERBIL="no" \
PROJECT_USES_WWAPPBASE_SYMLINK="yes"
