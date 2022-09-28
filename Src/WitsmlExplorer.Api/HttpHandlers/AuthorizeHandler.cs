using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize(Server witsmlServer, ICredentialsService credentialsService)
        {
            return Results.Ok(await credentialsService.ProtectBasicAuthorization(witsmlServer.Url));
        }
    }
}
