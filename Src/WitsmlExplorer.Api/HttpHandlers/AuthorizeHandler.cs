using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromServices] ICredentialsService credentialsService, HttpRequest httpRequest)
        {
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            return Results.Ok(await credentialsService.ProtectBasicAuthorization(basicAuth));
        }
    }
}
