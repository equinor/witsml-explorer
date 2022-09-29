using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromServices] ICredentialsService credentialsService)
        {
            return Results.Ok(await credentialsService.ProtectBasicAuthorization());
        }
    }
}
