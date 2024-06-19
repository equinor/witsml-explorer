# Authentication and Authorization in WITSML Explorer

Every request run against a WITSML server is run from the backend and needs to be authenticated.
Basic auth is required for a lot of WITSML servers, so that is currently the main way WITSML Explorer authenticates against them.

Most actions done by the user in WITSML Explorer involves fetching or writing data to external WITSML servers. All these requests require credentials to be provided to the `authorization` endpoint in advance.

It would be a very bad user experience if the user would have to provide credentials for every request to the API. 
Therefore an encrypted version of the passwords is saved in a memory-cache on the backend. The backend only stores them for a limited amount of time, and will provide them for every request involving WITSML servers. 

The backend has a [Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) storage running in memory, which is used for encrypting the passwords as well as decrypting them (only possible on the running instance).

When a request is forwarded to the WITSML server, the backend will decrypt the password from the cache, and use it when running the request.

Accessing the API without a frontend is explained at the end of each of the documents linked below.

## Authentication modes in WITSML Explorer.

Basic mode uses a session cookie to keep track of the user. This mode is used by setting `"OAuth2Enabled": false` in the API configuration and empty `VITE_MSALENABLED=` in the frontend environment. Basic flow is explained in [BASIC_AUTH.md](./BASIC_AUTH.md).

OAuth mode uses JWT authentication to keep track of the user. This mode is used by setting `"OAuth2Enabled": true` in the API configuration and `VITE_MSALENABLED=true` in the frontend environment. Current OAUTH implementation only supports Azure Entra ID. OAUTH flow is explained in [OAUTH.md](./OAUTH.md).
