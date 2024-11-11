# Deploy and run Witsml-Explorer

## MongoDB
See [setting up MongoDB locally](./MongoDb)

## Azure CosmosDB
See [setting up a database in Azure](../Scripts/Azure)

## Run locally with docker

Build dockerfiles for frontend and backend (see [build_docker_images.sh](../build_docker_images.sh), [Dockerfile-api](../Dockerfile-api) and [Dockerfile-frontend](../Dockerfile-frontend)).

### **Build api and frontend images**
```sh
❯ docker build -t witsmlexplorer-api:latest -f Dockerfile-api .
Building witsmlexplorer-api...
[+] Building 114.0s (24/24) FINISHED

❯ docker build -t witsmlexplorer-frontend:latest -f Dockerfile-frontend .
Building witsmlexplorer-frontend...
[+] Building 136.7s (21/21) FINISHED

❯ docker images
REPOSITORY                                              TAG             IMAGE ID       CREATED          SIZE
witsmlexplorer-frontend                                 latest          080fabac5c62   53 seconds ago   24.1MB
witsmlexplorer-api                                      latest          2f1eb2b076d1   3 minutes ago    271MB

```

## `config.json`

Create a `config.json` file containing the mongodb or cosmosdb credentials you created in the first steps.

`AllowedOrigin` should be set to the application (frontend) URL. For locally run applications, this should be set to `http://localhost:3000` (this is also the default value).

This value is used for setting up the allowed origins in CORS policy, so that backend/api can allow cross-origin requests from frontend. 


### **mongodb**
```json
{
  "MongoDb": {
    "Name": "witsml-explorer-db",
    "ConnectionString": "mongodb://user:password@host.docker.internal"
  },
  "AllowedOrigin": "http[s]://<domain-where-witsml-explorer-is-hosted>:<frontend port number if specified>",
  "OAuth2Enabled": false
}
```

### **cosmosdb**
```json
{
  "Db": {
    "Uri": "<...>", (Uri from relevant Azure Database => Overview => Uri )
    "Name": "<...>", (Container name from relevant Azure Database => DataExplorer || databaseName from config.cfg)
    "AuthKey": "<...>" (PrimaryKey from relevant Azure Database => Setting => Keys )
  },
  "AllowedOrigin": "http[s]://<domain-where-witsml-explorer-is-hosted>:<frontend port number if specified>",
  "OAuth2Enabled": false
}
```

Now use and change paths (if neccesary) in the provided file [docker-compose.yml](./Local/docker-compose.yml)

Start both the `api` and `frontend` with `docker compose up -d`

**Note:** The `ca-bundle.crt` setup is only needed if the WITSML server you are accessing use self signed certificates

```yml
version: '3.7'
services:
  api:
    image: witsmlexplorer-api:latest
    container_name: witsmlexplorer-api-dev
    ports:
      - 5000:5000
    volumes:
      - ./config.json:/app/config.json:ro
      - ./ca-bundle.crt:/etc/ssl/certs/ca-bundle.crt:ro
    environment:
      - SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt      

  web:
    image: witsmlexplorer-frontend:latest
    container_name: witsmlexplorer-frontend-dev
    ports:
      - 3000:3000

```

Raise the solution locally with `docker compose`
```sh
❯ docker compose up -d
[+] Running 3/3
 ⠿ Network local_default                    Created 
 ⠿ Container witsmlexplorer-frontend-dev    Started
 ⠿ Container witsmlexplorer-api-dev         Started

❯ docker ps

CONTAINER ID   IMAGE                            COMMAND                  CREATED         STATUS                PORTS                            NAMES
bd9dae6a9b35   witsmlexplorer-api:latest        "dotnet WitsmlExplor…"   4 seconds ago   Up 3 seconds          0.0.0.0:5000->5000/tcp           witsmlexplorer-api-dev
77518606909e   witsmlexplorer-frontend:latest   "/docker-entrypoint.…"   4 seconds ago   Up 3 seconds          80/tcp, 0.0.0.0:3000->3000/tcp   witsmlexplorer-frontend-dev
8e35f1192abe   mongo:4.4.1                      "docker-entrypoint.s…"   6 days ago      Up 5 hours            0.0.0.0:27017->27017/tcp         witsml-explorer-db
```
You should now have three containers running

* `docker-compose up`. Add `-d` if you want to run the application in the background
* Go to `http://localhost:3000` to open the application
* Use `docker-compose down` to stop the application

