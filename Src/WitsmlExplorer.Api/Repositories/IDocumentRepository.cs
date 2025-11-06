using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Repositories
{
    public interface IDocumentRepository<TDocument, in TDocumentId>
    {
        Task<TDocument> GetDocumentAsync(TDocumentId id);
        Task<ICollection<TDocument>> GetDocumentsAsync();
        Task<ICollection<TDocument>> GetDocumentsAsync(Expression<Func<TDocument, bool>> expression);
        Task<TDocument> CreateDocumentAsync(TDocument document);
        Task<TDocument> UpdateDocumentAsync(TDocumentId id, TDocument document);
        Task DeleteDocumentAsync(TDocumentId id);
        Task InitClientAsync();
    }

    public abstract class DbDocument<TDocumentId>
    {
        protected DbDocument(TDocumentId id)
        {
            Id = id;
        }

        public TDocumentId Id { get; set; }
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
