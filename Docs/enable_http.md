# Enable HTTP WITSML servers

> :warning: **Using HTTP to connect to WITSML servers is not secure.** HTTP does not encrypt data, making it vulnerable to interception, tampering, and man-in-the-middle attacks. It is strongly recommended to use HTTPS, which encrypts communications, to protect against these risks.

To use non secure link to Witsml server, your link needs to start with http and you need to change "enableHttp" setting based on the type of setup - see below.

## How to enable using non secure links in normal setup (web application)

In appsettings.json file, change to "enableHttp" setting to true.

## How to enable using non secure links in desktop edition

In the configuration file config.json, which is created in %AppData%\Roaming\WEx-Desktop during installation of desktop edition, set "enableHttp" setting to "true". 
