using System.Collections.Generic;
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

        public Task InitClientAsync()
        {
            return Task.CompletedTask;
        }

        public Task<TDocument> GetDocumentAsync(TDocumentId id)
        {
            var document = _collection.FindById(new BsonValue(id));
            return Task.FromResult(document);
        }

        public Task<ICollection<TDocument>> GetDocumentsAsync()
        {
            var documents = _collection.FindAll();
            return Task.FromResult<ICollection<TDocument>>(new List<TDocument>(documents));
        }

        public Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document)
        {
            _collection.Update(document);
            return GetDocumentAsync(id);
        }

        public Task<TDocument> CreateDocumentAsync(TDocument document)
        {
            _collection.Insert(document);
            return GetDocumentAsync(document.Id);
        }

        public Task DeleteDocumentAsync(TDocumentId id)
        {
            _collection.Delete(new BsonValue(id));
            return Task.CompletedTask;
        }
    }
}
