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

Change the username and password and where to put your data (defaults to `./data` folder in current directory)

The data folder you specify will be created when you run `docker compose up` for the first time.

When mongodb is running, you are ready to proceed with [Run locally with docker](../README.md)
