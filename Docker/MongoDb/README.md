# MongoDB

## Setup locally

To create and setup mongodb locally, you can customise and use the included `docker-compose.yml`.

```yml
version: '3.1'

services:
  mongo:
    image: mongo:4.4.1
    container_name: witsml-explorer-db
    restart: unless-stopped
    ports:
      - 27017:27017
    volumes:
      - ./data:/data/db                                     # Location for data folder can be changed.
    environment:
      - MONGO_INITDB_ROOT_USERNAME=<insert username>        # You should change this
      - MONGO_INITDB_ROOT_PASSWORD=<insert password>        # You should change this
```

Add an initial db username and password by editing the `docker-compose.yml` file and setting `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` (no space after `=`).
```
# Pull and run a default MongoDB locally
docker-compose up -d
```
The default is to mount a volume in the same directory, but that can be changed in the `docker-compose.yml` file based on your preference. After executing `docker-compose up -d ` once, you can reset docker-compose.yml, as the environment settings are only required the first time you run your mongoDb.

When mongodb is running, you are ready to proceed with [Run locally with docker](../README.md).
