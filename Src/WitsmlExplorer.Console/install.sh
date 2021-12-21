#!/usr/bin/env bash

dotnet pack
dotnet tool install --global --add-source ./nupkg witsml-cli
