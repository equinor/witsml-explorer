# Create Azure CosmosDB

### Cosmos database
Witsml Explorer requires a database to store application data. One option is to use a Cosmos database in Azure.

#### Setting up a database in Azure 
1) If not already installed, install Azure CLI on your computer [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest), and then login `az login`
2) Copy `config-example.cfg` into a new file `config.cfg` in folder `Scripts/Azure` and fill in `subscriptionId` and `resourceGroupName` from your Azure subscription and resourcegroup.
3) There exist some scripts  that may simplify setting up the necessary infrastructure for this project in folder `Scripts/Azure`. 
<br>Script to create Cosmos DB: ```./create-cosmos-db.sh```
<br>Script to run all together: ```./run-azure-scripts.sh```
4) In file `config.cfg` enter `databaseAccountName` and a name (container) for your database in `databaseName`.  
5) Run ```./create-cosmos-db.sh``` (prerequisite azure cli installed, and that your are logged in)

#### Configure backend to use CosmosDB
If you have a CosmosDB setup and ready, follow these steps to configure the backend properly.
```
#From project root.
cd Src/WitsmlExplorer.Api
# If you do not have a mysettings.json file, create it:
cp appsettings.json mysettings.json 
``` 
Add the following `"CosmosDb"` configuration to `mysettings.json`
```
{
  {...},
  "CosmosDb": {
    "Uri": "<...>", (Uri from relevant Azure Database => Overview => Uri )
    "Name": "<...>", (Container name from relevant Azure Database => DataExplorer || databaseName from config.cfg)
    "AuthKey": "<...>" (PrimaryKey from relevant Azure Database => Setting => Keys )
  },
  {...}
}
```
