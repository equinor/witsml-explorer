using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> Authorize(Uri serverUrl);
        public string Decrypt(ICredentials credentials);
        public bool VerifyIsEncrypted(ICredentials credentials);
        public Task<bool> AuthorizeWithToken(HttpRequest httpRequest);
        public Task<List<ICredentials>> ExtractCredentialsFromHeader(IHeaderDictionary headers);
    }
}
