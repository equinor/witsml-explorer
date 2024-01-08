using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Repositories
{
    public class CosmosRepository<TDocument, TDocumentId> : IDocumentRepository<TDocument, TDocumentId> where TDocument : DbDocument<TDocumentId>
    {
        private readonly string _dbName;
        private readonly string _containerId;
        private readonly CosmosClient _cosmosClient;

        public CosmosRepository(IConfiguration configuration)
        {
            _dbName = configuration["CosmosDb:Name"];
            var uri = configuration["CosmosDb:Uri"];
            var password = configuration["CosmosDb:AuthKey"];
            _containerId = $"{typeof(TDocument).Name}s";
            _cosmosClient = new CosmosClient(uri, password, new CosmosClientOptions
            {
                ConnectionMode = ConnectionMode.Gateway,
                SerializerOptions = new CosmosSerializationOptions { PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase }
            });
        }
        public async Task InitClientAsync()
        {
            await _cosmosClient.CreateDatabaseIfNotExistsAsync(_dbName);
            await _cosmosClient.GetDatabase(_dbName).CreateContainerIfNotExistsAsync(new ContainerProperties { Id = _containerId, PartitionKeyPath = "/id" });
        }

        public async Task<TDocument> GetDocumentAsync(TDocumentId id)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            try
            {
                return await container.ReadItemAsync<TDocument>(id.ToString(), new PartitionKey(id.ToString()));
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<ICollection<TDocument>> GetDocumentsAsync()
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
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
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            return await container.ReplaceItemAsync<TDocument>(document, document.Id.ToString());
        }

        public async Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            return await container.CreateItemAsync<TDocument>(document, new PartitionKey(document.Id.ToString()));
        }

        public async Task DeleteDocumentAsync(TDocumentId id)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);

            var deleteResponse = await container.DeleteItemStreamAsync(id.ToString(), new PartitionKey(id.ToString()));
            if (deleteResponse.StatusCode != HttpStatusCode.NoContent)
            {
                throw new RepositoryException($"Unable to delete document with id: {id}", (int)deleteResponse.StatusCode);
            }
        }
    }
}
