using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

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
            string base64EncodedCredentials = headers["Authorization"].ToString()["Basic ".Length..].Trim();
            StringValues sourceServer = headers["Witsml-Source-ServerUrl"];
            StringValues targetServer = headers["Witsml-ServerUrl"];
            Credentials credentials = new(base64EncodedCredentials);

            return Results.Ok(await jobService.CreateJob(jobType, credentials.Username, sourceServer, targetServer, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static async Task<IResult> GetJobInfosById([FromBody] IEnumerable<string> ids, IJobCache jobCache, HttpRequest httpRequest, ICredentialsService credentialsService)
        {
            bool authorized = await credentialsService.AuthorizeWithToken(httpRequest);
            if (!authorized)
            {
                return Results.Unauthorized();
            }
            return Results.Ok(jobCache.GetJobInfosById(ids));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static async Task<IResult> GetJobInfosByUser(string username, IJobCache jobCache, HttpRequest httpRequest, ICredentialsService credentialsService)
        {
            bool authorized = await credentialsService.AuthorizeWithToken(httpRequest);
            if (!authorized)
            {
                return Results.Unauthorized();
            }
            return Results.Ok(jobCache.GetJobInfosByUser(username));
        }

    }
}
