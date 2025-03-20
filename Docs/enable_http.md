# Enable HTTP WITSML servers

> :warning: **Using HTTP to connect to WITSML servers is not secure.** HTTP does not encrypt data, making it vulnerable to interception, tampering, and man-in-the-middle attacks. It is strongly recommended to use HTTPS, which encrypts communications, to protect against these risks.

To connect to a WITSML server using an unsecured link, the URL must begin with "http". Additionally, the "enableHttp" setting must be configured appropriately based on your setup.

## Enabling Non-Secure Links in the Web Application

In your configuration file (`appsettings.json`, `appsettings.<env>.json` or `mysettings.json`), set the "enableHttp" setting to true.

## Enabling Non-Secure Links in the Desktop Edition

In the desktop edition configuration file, set "enableHttp" to true. See [desktop edition configuration](../Src/WitsmlExplorer.Desktop/README.md#configuration) for further details.
