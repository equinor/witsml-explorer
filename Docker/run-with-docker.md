# Access to prebuilt images

Access to prebuilt docker images is restricted to users within the Equinor organization.

To access these images with docker, you need to create a personal access token in Github with scope
set to "read:packages". Users who should manage images should additionally have "repo, write:packages".

This token must be authorized with the Equinor organization. After creating the access token, select "Enable SSO" to authorize the token.

After creating and configuring the access token, login with docker: 

`docker login -u USERNAME -p ACCESS_TOKEN docker.pkg.github.com`

# Configuration

## `config.json`
Credentials can be set up within a `config.json` file located in the same folder as `docker-compose.yml`.
The configuraion should be set up like:
```
{
  "Db": {
    "Uri": "<...>", (Uri from relevant Azure Database => Overview => Uri )
    "Name": "<...>", (Container name from relevant Azure Database => DataExplorer || databaseName from config.cfg)
    "AuthKey": "<...>" (PrimaryKey from relevant Azure Database => Setting => Keys )
  }
  "Host": "http[s]://<domain-where-witsml-explorer-is-hosted>"
}
```

`Host` should be set to the domain where the application will be available. For locally run applications, this should be set to `http://localhost` (this is also the default value).
This value is used for setting up the notifications feed from the backend/api to the frontend application. 

# Running locally for development

When running locally there is normally no need for running nginx in front.
* `cd Docker/Local`
* `docker-compose pull`
* `docker-compose up`. Add `-d` if you want to run the application in the background
* Go to `http://localhost:3000` to open the application
* Use `docker-compose down` to stop the application

# Running on a server

Running on a server requires running an nginx in front of the api and the web containers. This is needed for configuring SSL.
You will find a docker-compose file in `Server` directory that similar to the one used for running docker-compose locally. 
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
