# Authentication and Authorization in WITSML Explorer
## WITSML server credentials flow (Basic)
Every request run against a WITSML server is run from the backend and needs to be authenticated.
Basic auth is required for a lot of WITSML servers, so that is currently the main way WE authenticates against them.

Most actions done by the user in WE involves fetching or writing data to external WITSML servers. All these requests require credentials to be provided to the `authorization` endpoint in advance.

It would be a very bad user experience if the user would have to provide credentials for every request to the API. 
Therefore an encrypted version of the passwords is saved in a memory-cache on the backend. The backend only stores them for a limited amount of time, and will provide them for every request involving WITSML servers. 

The backend has a [Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) storage running in memory, which is used for encrypting the passwords as well as decrypting them (only possible on the running instance).

When a request is forwarded to the WITSML server, the backend will decrypt the password from the cache, and use it when running the request.

__To use the API without the frontend, the user needs to provide credentials in the header for `WitsmlTargetServer` on the `/credentials/authorize` route. The format is Basic Authorization format Base64 encoded along with server URL. See Swagger for more information on Header information. Subsequent requests will automatically reuse the credentials that were saved to the cache when calling the `/credentials/authorize` route. Examples are provided in the [API Access without frontend](#api-access-without-frontend) section of this document.__

This is a description of the flow:
### 1. When the user connects to a server for the first time
  - frontend contacts `authorize` endpoint with entered credentials along with server url
  - if this is a new client without any cookie and id, generate an id for this client
  - backend verifies credentials with the WITSML server
  - verified credentials are added to a <username, encrypted password> dictionary cached under a unique cacheId based on client-id and server host
  - `TTL` before credentials are invalidated will be given by the query param `keep`
    - keep=true => 24 hours
    - keep=false or missing  => 1 hour
  - `[secure ,samesite=strict, httponly]` cookie is added to the response with uuid as value
  - **session cookie used**

### 2. Successive connections to API
  - frontend calls API with `WitsmlTargetServer` and `WitsmlTargetUsername` headers
  - API routes that handle two servers include `WitsmlSourceServer` and `WitsmlSourceUsername` headers as well
  - `[secure ,samesite=strict, httponly]` cookie is passed along with the request with id as value
  - backend uses uuid from cookie to lookup encrypted credentials in `CredentialsCache`
    - if no credentials exists, send response `401`. User will have to login to get a cookie with valid cache entry
  - given that multiple sets of credentials can be saved in the backend for a given server, it is sufficient to change the `WitsmlTargetUsername` (or Source) header to use a different set of credentials
    - in the frontend this can be achieved by clicking on the WITSML username in the top right corner menu, or in the server connections tab
  - **session cookie used**


```mermaid
sequenceDiagram
    Note left of Frontend: User selects WITSML <br> server for the first <br> time in current session
    Frontend->>+Frontend: No credentials exist,<br/> display credentials <br/> dialog
    Note left of Frontend: Enter and submit <br> credentials for <br> WITSML server
    Frontend->>+Api: Verify credentials using <br/> basic auth /api/credentials/authorize
    Api->>-Witsml Server: Verify credentials by <br/> querying for server capabilities <br/> using basic auth
    activate Witsml Server
    Witsml Server ->>- Api: Ok / No access 
    activate Api
    Api->>-Frontend: If not valid, return error and <br> display credentials dialog
    activate Api
    Api->>Api: If valid, encrypt password <br> and store it in memory <br> using DataProtection library
    Api->>Frontend: Return 200 OK + cookie
    Frontend->>-Api: Fetch wells using cookie<br>and WITSML username<br>fetching encrypted password from cache
    Api->>-Api: Decrypt password using <br> Data Protection Libary
    activate Api
    Api->>-Frontend: If not able to decrypt, or expired <br> send back unauthorized 401
    activate Api
    Frontend->>+Frontend: No credentials exist,<br/> display credentials <br/> dialog and try again    
    Api->>-Witsml Server: If able to decrypt, fetch wells <br> using basic auth
    activate Witsml Server
    Witsml Server->>-Api: Wells
    activate Api
    Api->>-Frontend: Wells
```

## WITSML server credentials flow (OAuth2)
OAuth2 authorization code flow and system credentials fetched from keyvault can also be used for a simplified end user experience. Examples are outlined below for Azure AD and Azure keyvault.

User will log in by Equinor tenant. 

### 1. When the user connects to a server for the first time

#### OAuth mode with system credentials access based on app role assignment
  - backend uses claim sub in Bearer token for user-to-app identification
  - when fetching the server list, system credentials usernames are returned if they are available for the given Azure user and WITSML server
  - system credentials username will appear in a dropdown when attempting to log in to an applicable WITSML server
  - if the user chooses to use system credentials, the backend fetches the credentials from keyvault, encrypts and stores the credentials in the backend cache identified by information in id_token (sub)
  - **TTL** before credentials are invalidated will be given by the query param `keep`
    - keep=true => 24 hours
    - keep=false or missing  => 1 hour
  - **no cookies involved**

#### OAuth mode not assigned the necessary role to use system creds from keyvault
  - frontend contacts authorize endpoint the same manner as in Basic mode
  - backend uses Bearer token sub for user identification
  - **no cookies involved**
### 2. Successive connections to API
  - frontend calls API with `WitsmlTargetServer` and `WitsmlTargetUsername` headers
  - API routes that handle two servers include `WitsmlSourceServer` and `WitsmlSourceUsername` headers as well
  - backend uses sub from the Bearer token and the username from the header to look up the encrypted password in CredentialsCache
    - if no credentials exists, send response 401 and display the credentials modal
  - **no cookies involved**

## Swagger
When developing, visit `https://localhost:5001/swagger/index.html` to examine endpoints and authentication schemes. Setup will be outlined below.

### Basic authentication
The `WitsmlServerHandler` at `/api/witsml-servers` endpoint can be used to get a list of witsml servers in json format without any credentials.

Steps to use endpoints with `Basic` authentication
1. Authenticate against the WITSML server through the `AuthorizationHandler` endpoint `/api/credentials/authorize`. Url and base64 encoded credentials needs to be provided with the request in the header `WitsmlTargetServer`. 
2. Now visit any endpoint, e.g. `/api/wells` and provide the same Url in the header `WitsmlTargetServer` (now without credentials), as well as the username in the `WitsmlTargetUsername` header

Further information about the header format is given on the swagger page/endpoint. 
### OAuth2 authentication
`OAuth2` authentication is turned off by default both in backend and frontend through the appsettings property `OAuth2Enabled`. For information about OAuth2 authorization code flow see: [auth code flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)

If you want to add this flow to SwaggerUI, you need to customize the following info matching your own Azure app registration in the `mysettings.json` file. For information about app registrations and app roles setup see []()

**example `mysettings.json` file:**

```json
    "OAuth2Enabled": true,
    "AzureAd": {
        "AppName": "witsml-explorer-api",
        "Instance": "https://login.microsoftonline.com/",
        "TenantId": "b3edbf8f-e8b2-4c4e-96fc-c86cdd7fd55f",
        "ClientId": "109e12e2-4ca7-48d0-af05-c834c88ff22c",
        "PolicyRoles": [  "admin", "developer", "employee" ],
        "TokenValidationParameters": {
            "ValidateAudience": false,
            "ValidateIssuerSigningKey": true,
            "ValidateTokenReplay": true
        },
        "Swagger": {
            "AppName": "witsml-explorer-swaggerui",
            "AuthorizationUrl": "https://login.microsoftonline.com/b3edbf8f-e8b2-4c4e-96fc-c86cdd7ed55f/oauth2/v2.0/authorize",
            "TokenUrl": "https://login.microsoftonline.com/b3edbf8f-e8b2-4c4e-96fc-c86cdd7ed55f/oauth2/v2.0/token",
            "ClientId": "5abc9bc0-3ecb-423b-8457-da3c017c547a",
            "Scopes": "api://a10111dc-712d-485f-8600-57be8c597921/access_as_user",
        },
        "KVWitsmlServerCreds": "witsmlexp-servers-kv",
    }
``` 

By enabling the `"OAuth2Enabled": true,` setting, you should now find a new entry: `AuthorizationCode with PKCE` available in the Swagger UI.

All endpoints will now need a logged in user, authenticated by your tenant.

### System credentials

System credentials for a server can be included through a `secrets.json` file, or in Azure keyvault:

**secrets.json format**
```json
"WitsmlCreds": {
    "prod":  { "Host": "https://url1", "UserId": "user1", "Password": "pw1" },
    "test":  { "Host": "https://url2", "UserId": "user2", "Password": "pw2" }
}    
```

To use Azure keyvault, create your keyvault (above named `witsmlexp-servers-kv`) and enter your system credentials as secrets in the following format to be included and automatically cached at api startup.

**example keyvault entries**


| Name         | Type      | Status   | Expiration date |
|--------------|-----------|------------|------------|
| witsmlcreds--prod--host | My server1 prod [R]      |         ||
| witsmlcreds--prod--password | My server1 prod [R]      |         ||
| witsmlcreds--prod--userid | My server1 prod [R]      |         ||
| witsmlcreds--test--host | My server2 test [CRUD]      |         ||
| witsmlcreds--test--password | My server2 test [CRUD]      |         ||
| witsmlcreds--test--userid | My server2 test [CRUD]      |         ||

 
## Serverlist

Credentials will be mapped on URL from secrets with the serverlist. `Server` entry in MongoDB or CosmosDB will have the property `roles`. The app role assigned to a server will be compared to the role claims in the JWT provided in the Authorization header. If a user has been assigned the same application role, system credentials will be made available to the user. An API call will use the system credentials if the system username is set in the `WitsmlTargetUsername` or `WitsmlSourceUsername` header.

For more info on app roles, see: [app roles](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps)

**example server json in list**
```json
{
    "name": "Equinor WITSML",
    "url": "https://witsml007.someserver/store/WITSML",
    "description": "Equinor testserver. Do not edit any datasets",
    "roles": [ "user" ]
}
```

**example JWT from Bearer token**
```json
  "roles": [
    "developer",
    "admin",
    "user"
  ]
```

## MSAL Frontend
To enable Oauth2 with MSAL in frontend, the following environment settings can be set:
```bash
# To disable MSAL, leave NEXT_PUBLIC_MSALENABLED empty
NEXT_PUBLIC_MSALENABLED=
NEXT_PUBLIC_AZURE_AD_TENANT_ID=
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=
NEXT_PUBLIC_AZURE_AD_URL_WITSMLEXPLORER=http://localhost:3000/
NEXT_PUBLIC_AZURE_AD_SCOPE_API=

```

## Hybrid Flow
It is possible to utilize both OAuth2 and Basic authentication security schemes at the same time. With this configuration the end user will have to authenticate against an authorization server that supports `OAuth2 Authorization Code Flow with PKCE`.

As described in the [Serverlist](#serverlist), Witsml Explorer will make a system user available based on how you configure your list of servers. If the Server has specified the `roles` and both the server and the Azure user have the same `app-roles`, the frontend will use the `Bearer` token received from the authorization server and relay this to the backend along with the url of the server. It will not ask the user for basic credentials (username:password) if the system username was specified in the `Witsml(Target/Source)Username` header.

The backend in turn will do a lookup on the users application role, and if eligible, use the `system-user` fetched from `keyvault` for the connection to the WITSML server.

### Basic witsmlexplorer flow
For an illustration of sequences initiated when the user queries a server without a `system-user`, visit the figure in the beginning of this document under `WITSML server credentials flow`

### OAuth2 witsmlexplorer flow with MSAL
The following diagram illustrates the flow for a user contacting a `Server` with a `system-user`. The setting `OAuth2Enabled=true` has been set in backend, and MSAL enabled in frontend:


```mermaid

graph TD
    A[1. WitsmlExplorer Frontend] -->|login| B[2. Auth Server]
    B[2. Auth Server] --> |token| A[WitsmlExplorer Frontend]
    A[1. WitsmlExplorer Frontend] --->|w/token:getservers| G[3. ServerlistDB]
    G[3. ServerlistDB] --->|servers| A[itsml-Explorer]
    A[1. WitsmlExplorer Frontend] ----> |w/token&username:getwells| H[3. WitsmlExplorer API]
    H[3. WitsmlExplorer API] ----> |wells| A[1. WitsmlExplorer Frontend]  
    H[3. WitsmlExplorer API] --> |getsyscreds| K[5. Azure Keyvault]
    K[5. Azure Keyvault] --> |syscreds| H[3. WitsmlExplorer API]
    H[3. WitsmlExplorer API] ---> |w/syscreds:getwells| J[6. WITSML Server]
    J[6. WITSML Server]  ---> |wells| H[4. WitsmlExplorer API]
```

1. End user visits Witsml-Explorer.
2. The end user will be redirected to login with the configured OAuth2 Authorization server (Azure AD).
3. Witsml-Explorer will fetch the initial Serverlist from DB. When OAuth2 is enabled both in the frontend and backend, retrieving the serverlist will only be available for logged in users. Similarly Create, Update and Delete of servers will be reserved for users with role `admin`. A list of available users will be returned for every server. These are previously logged in users and/or a system user.
4. If the user through the frontend chooses to query a server with an available system user, the backend will check the received `Bearer` JWT token for `app-roles`. This in turn will be checked against the configured `roles` for the server.
5. When one of the user roles and server roles overlap, the backend fetches system credentials from `Azure Keyvault` for this witsml server.
6. The server will now forward the query to the witsml server using `Basic` authorization with system credentials fetched from step 5.

The resulting list of wells will then be passed back to the frontend.

## API Access without frontend

Below are some examples on the use of API endpoints without the frontend. See information about `Swagger` and `Swashbuckle` earlier in the documents for detailed information on the endpoints

### Basic mode

`witsml-explorer` is in `Basic` mode. (Started with `OAuth2Enabled=false` in appsettings).

__1. Get witsml-server configuration list__ and cookie. You will need to include this cookie to subsequent calls to the API

```http
GET http://localhost:5000/api/witsml-servers HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3000
```
```http
HTTP/1.1 200 OK
Set-Cookie: witsmlexplorer=9a8c9c5d-1d0c-4ebf-867d-6641962da380; path=/; secure; samesite=strict; httponly
```

__2. Authorize WITSML credentials__ for the WITSML server you will query, this to ensure that backend encrypts the password and caches it against your session. The WitsmlTargetServer consists of base 64 encoded `username:password` (in the following example it is `user123:pass456`), and, after the 'at' sign `@`, the WITSML server URL.

```http
GET http://localhost:5000/api/credentials/authorize?keep=false HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3000
Cookie: witsmlexplorer=9a8c9c5d-1d0c-4ebf-867d-6641962da380
WitsmlTargetServer: dXNlcjEyMzpwYXNzNDU2@https://witsmlserver.using.basic.creds/Store/WITSML
```
```http
HTTP/1.1 200 OK
Content-Length: 0
Connection: close
Date: Tue, 22 Nov 2022 21:03:00 GMT
Server: Kestrel
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:3000
```

__3. Use endpoints__  
Include cookie. If credentials has expired or missing you will get a `401` response and will need to authorize (step 2) again first. `WitsmlTargetServer` and `WitsmlTargetUsername` have to match the information entered in step 2. to correctly use the cached credentials.

```http
GET http://localhost:5000/api/wells HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3000
Cookie: witsmlexplorer=9a8c9c5d-1d0c-4ebf-867d-6641962da380
WitsmlTargetServer: https://witsmlserver.using.basic.creds/Store/WITSML
WitsmlTargetUsername: user123
```
```http
HTTP/1.1 200 OK
Connection: close
Content-Type: application/json; charset=utf-8
Date: Tue, 22 Nov 2022 20:53:03 GMT
Server: Kestrel
Transfer-Encoding: chunked

[
  {
    "uid": "8b6b40ca-fcf5-4f4c-83ff-91a9f358c30b",
    "name": "_ Complete",
    "field": "Greenfield",
    "timeZone": "+01:00",
    "operator": "Equinor",
...
...
```

### OAuth2 mode

`witsml-explorer` is in `OAuth2` mode. (Started with `OAuth2Enabled=true` in appsettings).

__1. witsml-server configuration list__ (and other endpoints)

No cookie involved. But you will still need to authorize for servers configured as `Basic`.

**Prerequisite**: a valid `Bearer` token with app-roles and server configuration in place.

```http
GET https://localhost:5001/api/witsml-servers HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJ...<token here>
```

__2. Use endpoints__ 

If a server has system credentials in keyvault and the bearer of the token has the correct `role` for this server, you can use endpoints directly. Example below for rigs

```http
GET http://localhost:5000/api/wells/<wellId>/wellbores/<wellboreId>/rigs HTTP/1.1
Authorization: Bearer eyJ...<token here>
Content-Type: application/json
WitsmlTargetServer: https://witsmlserver.using.system.creds/store/WITSML
WitsmlTargetUsername: system-user123
```
__3. Authorize WITSML credentials__ 

If you do not have system credentials in keyvault and need to use Basic credentials, you must `authorize` first like below before using endpoints with the given server.

```http
GET http://localhost:5000/api/credentials/authorize?keep=false HTTP/1.1
Authorization: Bearer eyJ...<token here>
Host: localhost:5000
Content-Type: application/json
Origin: http://localhost:3000
WitsmlTargetServer: dXNlcjEyMzpwYXNzNDU2@https://witsmlserver.using.basic.creds/Store/WITSML
```
(note the base64 encoded `username:password` @ witsmlserver)
