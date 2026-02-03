using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using MongoDB.Bson;
using MongoDB.Driver;

namespace WitsmlExplorer.Api.Repositories
{
    public class MongoRepository<TDocument, TDocumentId> : IDocumentRepository<TDocument, TDocumentId> where TDocument : DbDocument<TDocumentId>
    {
        private readonly IMongoCollection<TDocument> _collection;

        public MongoRepository(IConfiguration configuration)
        {
            var dbName = configuration["MongoDb:Name"];
            var connectionString = configuration["MongoDb:ConnectionString"];
            var collectionName = $"{typeof(TDocument).Name}s";
            var client = new MongoClient(connectionString);
            var db = client.GetDatabase(dbName);
            _collection = db.GetCollection<TDocument>(collectionName);
        }

        public Task InitClientAsync(string PartitionKeyPath)
        {
            return Task.CompletedTask;
        }

        public async Task<TDocument> GetDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            var filter = Builders<TDocument>.Filter.Eq("_id", id);
            var documents = await _collection.FindAsync(filter);
            return documents.FirstOrDefault();
        }

        public async Task<ICollection<TDocument>> GetDocumentsAsync()
        {
            var documents = await _collection.FindAsync(new BsonDocument());
            return documents.ToList<TDocument>();
        }

        public async Task<ICollection<TDocument>> GetDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            var result = await _collection.FindAsync(expression);
            return result.ToList<TDocument>();
        }

        public async Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document)
        {
            var filter = Builders<TDocument>.Filter.Eq("_id", id);
            return await _collection.FindOneAndReplaceAsync(filter, document);
        }

        public async Task UpdateDocumentsAsync(IList<TDocument> documents)
        {
            var replaceModels = new List<ReplaceOneModel<TDocument>>();

            foreach (var document in documents)
            {
                var filter = Builders<TDocument>.Filter.Eq("_id", document.Id);
                replaceModels.Add(new ReplaceOneModel<TDocument>(filter, document));
            }

            await _collection.BulkWriteAsync(replaceModels);
        }

        public async Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            await _collection.InsertOneAsync(document);
            return await GetDocumentAsync(document.Id);
        }

        public async Task CreateDocumentsAsync(IList<TDocument> documents)
        {
            await _collection.InsertManyAsync(documents);
        }

        public async Task DeleteDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            var filter = Builders<TDocument>.Filter.Eq("_id", id);
            await _collection.FindOneAndDeleteAsync(filter);
        }

        public async Task DeleteDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            await _collection.DeleteManyAsync(expression);
        }
    }
}
