#!/bin/bash

echo "Building witsmlexplorer-api..."
docker build -t witsmlexplorer-api:latest -f Dockerfile-api .

echo "Building witsmlexplorer-frontend..."
docker build -t witsmlexplorer-frontend:latest -f Dockerfile-frontend .
