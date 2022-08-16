using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class JobHandler
{
    public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IJobService jobService)
    {
        jobService.CreateJob(jobType, httpRequest.Body);
        return Results.Ok(await Task.Run(() => "JobId"));
    }
}
