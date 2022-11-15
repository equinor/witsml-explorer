# Deploy and run Witsml-Explorer

## MongoDB
See []()

## Azure CosmosDB
See []()

## Run locally with docker

Build dockerfiles for frontend and backend (see `build_docker_images.sh`, `Dockerfile-api` and `Dockerfile-frontend`)

**Build api and backend images**
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

create a `config.json` file containing the mongodb or cososdb credentials you have created.

**mongodb**
```json
}
  "MongoDb": {
    "Name": "witsml-explorer-db",
    "ConnectionString": "mongodb://user:password@localhost"
  }
}
```

**cosmosdb**
```json
{
  "Db": {
    "Uri": "<...>", (Uri from relevant Azure Database => Overview => Uri )
    "Name": "<...>", (Container name from relevant Azure Database => DataExplorer || databaseName from config.cfg)
    "AuthKey": "<...>" (PrimaryKey from relevant Azure Database => Setting => Keys )
  }
  "Host": "http[s]://<domain-where-witsml-explorer-is-hosted>"
}
```
