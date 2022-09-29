using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Configuration;

namespace WitsmlExplorer.Api.Services
{
    public interface ICredentialsService
    {
        public Task<string> ProtectBasicAuthorization();

        public Task<bool> AuthorizeWithEncryptedPassword(HttpRequest httpRequest);
        public Task<List<ServerCredentials>> GetCredentialsFromHeaders(IHeaderDictionary headers);
        public Task<ServerCredentials> GetCredsWithToken(string token, string serverHeader);
        public ServerCredentials GetBasicCredsFromHeader(string serverHeader);
    }
}
