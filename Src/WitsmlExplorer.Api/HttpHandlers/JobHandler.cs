using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class JobHandler
    {
        [Produces(typeof(string))]
        public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IJobService jobService)
        {
            IHeaderDictionary headers = httpRequest.Headers;
            StringValues sourceServer = headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            StringValues targetServer = headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            string targetServerString = targetServer.ToString();
            BasicCredentials basic = targetServerString.Split("@").Length == 2 ? new(targetServerString.Split("@")[0]) : new BasicCredentials();
            return Results.Ok(await jobService.CreateJob(jobType, basic.UserId ?? "unknown", sourceServer, targetServer, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosById([FromBody] IEnumerable<string> ids, IJobCache jobCache)
        {
            return Results.Ok(jobCache.GetJobInfosById(ids));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByUser(string username, IJobCache jobCache)
        {
            return Results.Ok(jobCache.GetJobInfosByUser(username));
        }

    }
}
