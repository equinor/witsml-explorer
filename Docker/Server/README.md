# Deploy on server


Running on a server requires running an nginx in front of the api and the web containers. This is needed for configuring SSL.

You will find a [docker-compose-yml](./docker-compose-yml) that is similar to the one used for running docker-compose locally. 

The difference is that `web` and `api` containers do not expose their ports outside of docker, and that an nginx instance is running in front forwarding the requests.

## docker-compose.yml and nginx.conf
You might need to do some changes to make this run on a server.
* In `docker-compose.yml` ensure that the volumes that are mapped into the containers for nginx from the host OS have the correct host path.
* The volume `/etc/nginx` requires both an `nginx.conf` file which you can find next to the `docker-compose.yml` file, and also a `certs` directory. Here you need to place the certificate and key files. Ensure that the naming corresponds to what you configure in the `nginx.conf` file.

When the configuration is in place, run the following to pull fresh images and run them:
* `docker-compose pull`
* `docker-compose up`. Add `-d` if you want to run the application in the background
* Go to `https://yourserver` to open the application
* Use `docker-compose down` to stop the application
