using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;
public static class JobHandler
{
    [Produces(typeof(string))]
    public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IJobService jobService)
    {
        IHeaderDictionary headers = httpRequest.Headers;
        string base64EncodedCredentials = headers["Authorization"].ToString()["Basic ".Length..].Trim();
        StringValues witsmlServer = headers["Witsml-Source-ServerUrl"];
        Credentials credentials = new(base64EncodedCredentials);

        return Results.Ok(await jobService.CreateJob(jobType, credentials.Username, witsmlServer, httpRequest.Body));
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
