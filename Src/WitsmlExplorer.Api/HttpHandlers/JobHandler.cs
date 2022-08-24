using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;
public static class JobHandler
{
    [Produces(typeof(string))]
    public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IJobService jobService)
    {
        return Results.Ok(await jobService.CreateJob(jobType, httpRequest.Body));
    }

    [Produces(typeof(IEnumerable<JobInfo>))]
    public static IResult GetJobInfos([FromBody] IEnumerable<string> ids, IJobCache jobCache)
    {
        return Results.Ok(jobCache.GetJobInfos(ids));
    }

}
