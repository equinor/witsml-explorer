using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> BasicAuthorization(Uri serverUrl);
        public string Decrypt(ICredentials credentials);
        public bool VerifyIsEncrypted(ICredentials credentials);
        public Task<bool> AuthorizeWithEncryptedPassword(HttpRequest httpRequest);
        public Task<List<ICredentials>> GetCredentials(IHeaderDictionary headers);
    }
}
