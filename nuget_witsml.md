## Access pre-built Witsml nuget package

If you only need to include the [Witsml](https://github.com/equinor/witsml-explorer/tree/main/Src/Witsml) project
```sh
witsml-explorer/Src/Witsml
``` 
Witsml nuget package can be added to your own project using [nuget](https://docs.microsoft.com/en-us/nuget/). 
It is necessary to author a new personal access token to be able to add the package to your project. A `nuget.config` (config file at solution, user or global scope) has to accommodate for username and the token afterwards.

**Example** 

1. Create your api access token at [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Make the token available through a config file at your preferred location (see: [configuring-nuget-behavior](https://docs.microsoft.com/en-us/nuget/consume-packages/configuring-nuget-behavior))
3. Add the Witsml package to your project
   ```sh
   dotnet add PROJECT package Witsml --version 1.0.18
   ```
To keep secrets out of your solution, use environment variables or place you nuget.config file under user scope (e.g. `~/.nuget/nuget.config`). An example with credentials as environment variables has been outlined below

***nuget.conf***
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <packageSources>
        <add key="equinor" value="https://nuget.pkg.github.com/equinor/index.json" />
        <add key="nuget.org" value="https://api.nuget.org/v3/index.json" protocolVersion="3" />
    </packageSources>
    <packageSourceCredentials>
        <equinor>
            <add key="Username" value="%USERNAME%" />
            <add key="ClearTextPassword" value="%CLEARTEXTPASSWORD%" />
        </equinor>
    </packageSourceCredentials>
</configuration>
```
