using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Witsml.Data;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class CapHandler
    {
        [Produces(typeof(WitsmlServerCapabilities))]
        public static async Task<IResult> GetCap(ICapService capService)
        {
            return TypedResults.Ok(await capService.GetCap());
        }
    }
}
