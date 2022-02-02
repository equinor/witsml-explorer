using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Repositories
{
    public class CosmosRepository<TDocument, TDocumentId> : IDocumentRepository<TDocument, TDocumentId> where TDocument : DbDocument<TDocumentId>
    {
        private readonly string dbName;
        private readonly string containerId;
        private readonly CosmosClient cosmosClient;

        public CosmosRepository(IConfiguration configuration)
        {
            dbName = configuration["CosmosDb:Name"];
            var uri = configuration["CosmosDb:Uri"];
            var password = configuration["CosmosDb:AuthKey"];
            containerId = $"{typeof(TDocument).Name}s";
            cosmosClient = new CosmosClient(uri, password, new CosmosClientOptions
            {
                ConnectionMode = ConnectionMode.Gateway
                // TODO Add the following line when https://github.com/Azure/azure-cosmos-dotnet-v3/issues/1193 is fixed. Also remove JsonPropertyName attributes from models.
                // SerializerOptions = new CosmosSerializationOptions{ PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase }
            });
        }
        public async Task InitClientAsync()
        {
            await cosmosClient.CreateDatabaseIfNotExistsAsync(dbName);
            await cosmosClient.GetDatabase(dbName).CreateContainerIfNotExistsAsync(new ContainerProperties { Id = containerId, PartitionKeyPath = "/id" });
        }

        public async Task<TDocument> GetDocumentAsync(TDocumentId id)
        {
            var container = cosmosClient.GetContainer(dbName, containerId);
            var itemResponse = await container.ReadItemAsync<TDocument>(id.ToString(), new PartitionKey(id.ToString()));

            return itemResponse;
        }

        public async Task<IEnumerable<TDocument>> GetDocumentsAsync()
        {
            var container = cosmosClient.GetContainer(dbName, containerId);
            var queryDefinition = new QueryDefinition("select * from T");

            var results = new List<TDocument>();
            var iterator = container.GetItemQueryIterator<TDocument>(queryDefinition);
            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }

        public async Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document)
        {
            var container = cosmosClient.GetContainer(dbName, containerId);
            var itemResponse = await container.ReplaceItemAsync<TDocument>(document, document.id.ToString());
            return itemResponse;
        }

        public async Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            var container = cosmosClient.GetContainer(dbName, containerId);
            var createResponse = await container.CreateItemAsync<TDocument>(document, new PartitionKey(document.id.ToString()));

            return createResponse;
        }

        public async Task DeleteDocumentAsync(TDocumentId id)
        {
            var container = cosmosClient.GetContainer(dbName, containerId);

            var deleteResponse = await container.DeleteItemStreamAsync(id.ToString(), new PartitionKey(id.ToString()));
            if (((uint) deleteResponse.StatusCode) != 204)
            {
                throw new RepositoryException($"Unable to delete document with id: {id}", (int) deleteResponse.StatusCode);
            }
        }
    }
}
