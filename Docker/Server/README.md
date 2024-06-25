# Deploy on server

## Configure application

Configure your application according to [this guide](../README.md#deploy-and-run-witsml-explorer)

## OAUTH

If you are planning on using OAUTH with Azure, see [OAUTH.md](../../Docs/OAUTH.md)

## Configure docker-compose.yml

You will find a [docker-compose-yml](./docker-compose.yml) that is similar to the one used for running docker-compose locally. The difference is that `web` and `api` containers do not expose their ports outside of docker, and that an nginx instance is running in front forwarding the requests.

In `docker-compose.yml` ensure that the volumes that are mapped into the containers for nginx from the host OS have the correct host path.

## Configure nginx

Running on a server requires running an nginx in front of the api and the web containers. This is needed for configuring SSL.

The volume `/etc/nginx` requires both an [`nginx.conf`](nginx.conf) file, and a `certs` directory. Here you need to place the certificate and key files. Ensure that the naming corresponds to what you configure in the `nginx.conf` file.

## Build docker images

Follow [Run locally with docker](../README.md#build-api-and-frontend-images) to build the docker images. You can either clone the application and build the images locally on the server, or create a workflow to build the images and then push them to a container registry. Make sure you use the same name in the building process and in docker-compose.yml.

## Start docker containers

When the configuration is in place, run the following to pull fresh images and run them:
* `docker-compose pull`.
* `docker-compose up -d`. `-d` makes the application run in the background.
* Go to `https://yourserver` to open the application
* Use `docker-compose down` to stop the application

## Update your application

Before you update your application, make sure that no jobs are running.

To update your application, build and pull your new containers, and re-run `docker-compose up -d`.

Run `docker image prune --force --filter dangling=true` to remove dangling images.
