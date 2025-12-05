using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;

using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
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
                SerializerOptions = new CosmosSerializationOptions { PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase },
                AllowBulkExecution = true
            });
        }
        public async Task InitClientAsync(string partitionKeyPath = "/id")
        {
            await _cosmosClient.CreateDatabaseIfNotExistsAsync(_dbName);
            await _cosmosClient.GetDatabase(_dbName).CreateContainerIfNotExistsAsync(new ContainerProperties { Id = _containerId, PartitionKeyPath = partitionKeyPath });
        }

        public async Task<TDocument> GetDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            try
            {
                return await container.ReadItemAsync<TDocument>(id.ToString(), new PartitionKey(partitionKeyValue ?? id.ToString()));
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

        public async Task<ICollection<TDocument>> GetDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);

            var results = new List<TDocument>();

            var iterator = container.GetItemLinqQueryable<TDocument>()
                .Where(expression)
                .ToFeedIterator();

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
            return await container.ReplaceItemAsync<TDocument>(document, id.ToString(), new PartitionKey(document.PartitionKeyValue));
        }

        public async Task UpdateDocumentsAsync(IList<TDocument> documents)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            var groupedByPartition = documents.GroupBy(d => d.PartitionKeyValue);

            foreach (var group in groupedByPartition)
            {
                var concurrentTasks = new List<Task>();
                foreach (var document in group)
                {
                    concurrentTasks.Add(container.ReplaceItemAsync<TDocument>(document, document.Id.ToString(), new PartitionKey(group.Key)));

                    if (concurrentTasks.Count == 100)
                    {
                        await Task.WhenAll(concurrentTasks);
                        concurrentTasks = new List<Task>();
                    }
                }

                if (concurrentTasks.Count > 0)
                {
                    await Task.WhenAll(concurrentTasks);
                }
            }
        }

        public async Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            return await container.CreateItemAsync<TDocument>(document, new PartitionKey(document.PartitionKeyValue));
        }

        public async Task CreateDocumentsAsync(IList<TDocument> documents)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);
            var groupedByPartition = documents.GroupBy(d => d.PartitionKeyValue);

            foreach (var group in groupedByPartition)
            {
                var concurrentTasks = new List<Task>();
                foreach (var document in group)
                {
                    concurrentTasks.Add(container.CreateItemAsync<TDocument>(document, new PartitionKey(group.Key)));

                    if (concurrentTasks.Count == 100)
                    {
                        await Task.WhenAll(concurrentTasks);
                        concurrentTasks = new List<Task>();
                    }
                }

                if (concurrentTasks.Count > 0)
                {
                    await Task.WhenAll(concurrentTasks);
                }
            }
        }

        public async Task DeleteDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);

            var deleteResponse = await container.DeleteItemStreamAsync(id.ToString(), new PartitionKey(partitionKeyValue ?? id.ToString()));
            if (deleteResponse.StatusCode != HttpStatusCode.NoContent)
            {
                throw new RepositoryException($"Unable to delete document with id: {id}", (int)deleteResponse.StatusCode);
            }
        }

        public async Task DeleteDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            var container = _cosmosClient.GetContainer(_dbName, _containerId);

            var idsToDelete = new List<(TDocumentId Id, string PartitionKeyValue)>();

            var iterator = container.GetItemLinqQueryable<TDocument>()
                .Where(expression)
                .Select(d => new { d.Id, d.PartitionKeyValue })
                .ToFeedIterator();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                foreach (var item in response)
                {
                    idsToDelete.Add(new(item.Id, item.PartitionKeyValue));
                }
            }


            var groupedByPartition = idsToDelete.GroupBy(d => d.PartitionKeyValue);

            foreach (var group in groupedByPartition)
            {
                var concurrentTasks = new List<Task>();
                foreach (var document in group)
                {
                    concurrentTasks.Add(container.DeleteItemAsync<TDocument>(document.Id.ToString(), new PartitionKey(group.Key)));

                    if (concurrentTasks.Count == 100)
                    {
                        await Task.WhenAll(concurrentTasks);
                        concurrentTasks = new List<Task>();
                    }
                }

                if (concurrentTasks.Count > 0)
                {
                    await Task.WhenAll(concurrentTasks);
                }
            }
        }
    }
}
