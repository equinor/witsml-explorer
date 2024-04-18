# Witsml Explorer Desktop Edition

Witsml Explorer Desktop Edition is an easy to install version of Witsml Explorer. Not all features are supported in the desktop edition.

## Supported operating systems
- Windows


## Installation guide
The install can be found in [Releases](https://github.com/equinor/witsml-explorer/releases)
Go to GitHub releases, and download the Windows installer and run it. Follow installer.

## For developers

How to run in development mode
```sh
cd Src/WitsmlExplorer.Desktop/
# Download dependencies
yarn
# Run in development mode
yarn dev
```

Run Electron production preview
```sh
yarn preview
```

Build installer and run through installer
```sh
yarn electron:dist
```
Then run the .exe file located in the `Src/WitsmlExplorer.Desktop/dist` to install it.


### Log files
Log files are generated when running the ... and can be found in the directory ...

### Database
A database is generated when running the ... and can be found in the directory appData roaming?



