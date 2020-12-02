#!/bin/bash

echo "Building witsmlexplorer-api..."
docker build -t docker.pkg.github.com/equinor/witsml-explorer/witsmlexplorer-api -f Dockerfile-api .

echo "Building witsmlexplorer-frontend..."
docker build -t docker.pkg.github.com/equinor/witsml-explorer/witsmlexplorer-frontend -f Dockerfile-frontend .
