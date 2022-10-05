using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class JobHandler
    {
        [Produces(typeof(string))]
        public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IJobService jobService, ICredentialsService credentialsService)
        {
            ServerCredentials witsmlTarget = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlTargetServerHeader, n => "");
            ServerCredentials witsmlSource = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlSourceServerHeader, n => "");

            (string username, string witsmlUsername) = await credentialsService.GetUsernames();

            return Results.Ok(await jobService.CreateJob(jobType, username, witsmlUsername, witsmlSource.Host?.ToString(), witsmlTarget.Host?.ToString(), httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByUser(string username, IJobCache jobCache, IConfiguration configuration, ICredentialsService credentialsService)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            if (!useOAuth2)
            {
                if (!credentialsService.ValidEncryptedBasicCredentials(WitsmlClientProvider.WitsmlTargetServerHeader))
                {
                    return Results.Unauthorized();
                }
            }
            return Results.Ok(jobCache.GetJobInfosByUser(username));
        }

    }
}
