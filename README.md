# Witsml Explorer
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) ![Build and Test](https://github.com/equinor/witsml-explorer/workflows/Build%20and%20Test/badge.svg) 
[![Package and publish](https://github.com/equinor/witsml-explorer/actions/workflows/publish.yml/badge.svg)](https://github.com/equinor/witsml-explorer/actions/workflows/publish.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](/CONTRIBUTING.md)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/7274/badge)](https://bestpractices.coreinfrastructure.org/projects/7274)

Witsml Explorer is a data management tool used for browsing and editing data directly on [WITSML](https://en.wikipedia.org/wiki/Wellsite_information_transfer_standard_markup_language) servers.

## Demo Videos
Please see [Demo Videos](/Media/README.md)

## Key features
* Runs directly in your browser, no need to install additional software.
* An intuitive and easy to use interface.
* Connect to any WITSML server running version 1.4.1.1.
* Supported WITSML objects includes: wells, wellbores, bharuns, log objects, curves, messages, rigs, risks, trajectories, trajectory stations, tubulars, tubularcomponents, and wbgeometries.
* Trim log objects and individual curves.
* Copy objects and sub objects (also between different servers!).
* URL deep linking directly to objects

## Witsml as a Nuget package
Please see [nuget_witsml.md](/Docs/nuget_witsml.md)

## Witsml Explorer Desktop Edition
Please see [desktop edition readme](/Src/WitsmlExplorer.Desktop/README.md)

## Contributing
Please see our [contributing.md](/CONTRIBUTING.md).

## AuthN/Z
Please see our [auth.md](/Docs/AUTH.md).

## Database
Please see [mongoDb](Docker/MongoDb/README.md), [cosmosDb](Scripts/Azure/README.md) or [LiteDb](Contributing.md#using-litedb) readme.

## Run locally
Please see our [docker setup](/Docker/README.md).

## Deploy on server
Please see our [server readme](./Docker/Server/README.md).

## API custom client access
Please visit [API client access](/Docs/APICLIENT.md).

## Enable HTTP WITSML servers
Please see [enable HTTP](/Docs/enable_http.md).

## Community
Please read and respect the [CODE OF CONDUCT](/CODE_OF_CONDUCT.md)

## Reporting a Vulnerability
Please see our [Security Policy](/SECURITY.md)

## License
Witsml Explorer has the Apache-2.0 license.
