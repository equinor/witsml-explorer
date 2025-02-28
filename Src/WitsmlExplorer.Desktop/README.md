# Witsml Explorer Desktop Edition

Witsml Explorer Desktop Edition is an easy-to-install version of Witsml Explorer. However, this edition does not support all features as the web application.

> :warning: **Please be aware that there is a potential risk associated with running jobs while using the desktop edition**: As the API is running locally on your machine, there is a potential risk that critical jobs may not be able to finish. This could be due to exiting the application while running a job, computer shutdown, power outage or any other cause that forces the computer or application to shut down.

## Supported operating systems

- Windows 64-bit

<!-- ## Installation guide
The installer can be downloaded from our [GitHub releases page](https://github.com/equinor/witsml-explorer/releases). Download and run the installer. -->

## Configuration

A configuration file is created in `%AppData%\Roaming\WEx-Desktop\config.json`. It can be edited to change the API port and the path of logging and database files. You can also enable/disable non-secure connection (enableHttp) to Witsml server.

### Default configuration file
```
{
    "apiPort": "35427",
    "dbPath": "C:\\Users\\USER\\AppData\\Roaming\\WEx-Desktop\\witsml-explorer-db.db",
    "logsPath": "C:\\Users\\USER\\AppData\\Roaming\\WEx-Desktop\\logs",
    "enableHttp": "false"
}
```

## For developers

Install dependencies:

```sh
cd Src/WitsmlExplorer.Desktop/
# Download dependencies
yarn
```

Run in developer mode:

```sh
# From Src/WitsmlExplorer.Desktop/ run:
yarn dev
```

Run production preview:

```sh
# From Src/WitsmlExplorer.Desktop/ run:
yarn preview
```

Build an installer and install it on your computer:

```sh
# From Src/WitsmlExplorer.Desktop/ run:
yarn electron:dist
```

The installer can be found in `Src/WitsmlExplorer.Desktop/dist/WExDesktopInstaller.Windows.x64.<version>.exe`. Run it and follow the instructions.

Run playwright tests:
```sh
# From Src/WitsmlExplorer.Desktop/ run:
yarn electron:pack
yarn test:pack

# Debug tests interactively:
yarn test:pack --debug
```

### API log files for debugging

Check the [Configuration](#configuration) file to see where the logging files are placed.

## Releasing New Version
To release a new version of Witsml Explorer Desktop Edition, follow these step-by-step instructions:

1. First, bump the version number in `Src\WitsmlExplorer.Desktop\package.json` to match the version in the tag you will create in step 2. Merge in the changes to the `main` branch.
2. Create a new tag to mark the specific point in the project's history you want to release. You can use the following command:
```sh
# Create tag
git tag -a wex-desktop@<version> -m "<message>"

# Push the tag to origin
git push origin wex-desktop@<version>
```
3. Merge the `main` branch into the `stable-desktop-wex` branch to keep the current released version in its own branch.

4. Go to our GitHub page and navigate to [Actions](https://github.com/equinor/witsml-explorer/actions). Run the *Release Desktop Edition* action and use workflow from the `main` branch and type in the `<tag_name>` you used in step 1.

5. It's also a good idea to improve the release notes. You can do this from the [releases page](https://github.com/equinor/witsml-explorer/releases). Click the edit button and add the necessary notes for this release.
