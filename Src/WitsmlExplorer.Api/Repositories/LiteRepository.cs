using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

using LiteDB;

using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Repositories
{
    public class LiteDbRepository<TDocument, TDocumentId> : IDocumentRepository<TDocument, TDocumentId> where TDocument : DbDocument<TDocumentId>
    {
        private readonly ILiteCollection<TDocument> _collection;

        public LiteDbRepository(IConfiguration configuration)
        {
            var filename = configuration["LiteDb:Name"];
            var db = new LiteDatabase(@$"Filename={filename};Connection=shared");
            var collectionName = $"{typeof(TDocument).Name}s";
            _collection = db.GetCollection<TDocument>(collectionName);
        }

        public Task InitClientAsync(string PartitionKeyPath)
        {
            return Task.CompletedTask;
        }

        public Task<TDocument> GetDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            var document = _collection.FindById(new BsonValue(id));
            return Task.FromResult(document);
        }

        public Task<ICollection<TDocument>> GetDocumentsAsync()
        {
            var documents = _collection.FindAll();
            return Task.FromResult<ICollection<TDocument>>(new List<TDocument>(documents));
        }

        public Task<ICollection<TDocument>> GetDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            var documents = _collection.Find(expression);
            return Task.FromResult<ICollection<TDocument>>(new List<TDocument>(documents));
        }

        public Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document)
        {
            _collection.Delete(new BsonValue(id));
            _collection.Insert(document);
            return GetDocumentAsync(id);
        }

        public async Task UpdateDocumentsAsync(IList<TDocument> documents)
        {
            foreach (var document in documents)
            {
                await UpdateDocumentAsync(document.Id, document);
            }
        }

        public Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            _collection.Insert(document);
            return GetDocumentAsync(document.Id);
        }

        public Task CreateDocumentsAsync(IList<TDocument> documents)
        {
            return Task.FromResult(_collection.InsertBulk(documents));
        }

        public Task DeleteDocumentAsync(TDocumentId id, string partitionKeyValue = null)
        {
            _collection.Delete(new BsonValue(id));
            return Task.CompletedTask;
        }

        public Task DeleteDocumentsAsync(Expression<Func<TDocument, bool>> expression)
        {
            _collection.DeleteMany(expression);
            return Task.CompletedTask;
        }
    }
}
