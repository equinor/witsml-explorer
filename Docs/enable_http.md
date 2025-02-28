# Enable HTTP WITSML servers

> :warning: **Using HTTP to connect to WITSML servers is not secure.** HTTP does not encrypt data, making it vulnerable to interception, tampering, and man-in-the-middle attacks. It is strongly recommended to use HTTPS, which encrypts communications, to protect against these risks.

To connect to a WITSML server using an unsecured link, the URL must begin with "http". Additionally, the "enableHttp" setting must be configured appropriately based on your setup.

## How to enable using non secure links in normal setup (web application)

In your configuration file (`appsettings.json`, `appsettings.<env>.json` or `mysettings.json`), set the "enableHttp" setting to true.

## How to enable using non secure links in desktop edition

In the configuration file config.json, which is created in %AppData%\Roaming\WEx-Desktop during installation of desktop edition, set "enableHttp" setting to "true". 
