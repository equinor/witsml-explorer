using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Repositories
{
    public interface IDocumentRepository<TDocument, in TDocumentId>
    {
        Task<TDocument> GetDocumentAsync(TDocumentId id, string partitionKeyValue = null);
        Task<ICollection<TDocument>> GetDocumentsAsync();
        Task<ICollection<TDocument>> GetDocumentsAsync(Expression<Func<TDocument, bool>> expression);
        Task<TDocument> CreateDocumentAsync(TDocument document);
        Task CreateDocumentsAsync(IList<TDocument> documents);
        Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document);
        Task UpdateDocumentsAsync(IList<TDocument> documents);
        Task DeleteDocumentAsync(TDocumentId id, string partitionKeyValue = null);
        Task DeleteDocumentsAsync(Expression<Func<TDocument, bool>> expression);
        Task InitClientAsync(string partitionKeyPath = null);
    }

    public abstract class DbDocument<TDocumentId>
    {
        protected DbDocument(TDocumentId id)
        {
            Id = id;
        }

        public TDocumentId Id { get; set; }

        [MongoDB.Bson.Serialization.Attributes.BsonIgnore]
        [LiteDB.BsonIgnore]
        [JsonIgnore]
        public virtual string PartitionKeyValue => Id.ToString();
    }

    public class RepositoryException : Exception
    {
        public RepositoryException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }

        public int StatusCode { get; private set; }
    }
}
