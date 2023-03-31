using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class ChangeLogHandler
    {
        [Produces(typeof(IEnumerable<ChangeLog>))]
        public static async Task<IResult> GetChangeLogs(string wellUid, string wellboreUid, IChangeLogService changeLogService)
        {
            return TypedResults.Ok(await changeLogService.GetChangeLogs(wellUid, wellboreUid));
        }
    }
}
