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

            string bearerAuth = httpRequest.Headers["Authorization"];
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            ServerCredentials witsmlTarget = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlTargetServerHeader, n => "");
            ServerCredentials witsmlSource = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlSourceServerHeader, n => "");

            (string username, string witsmlUsername) = credentialsService.GetUsernamesFromHeaderValues(bearerAuth, basicAuth);
            JobInfo jobInfo = new()
            {
                Username = username,
                WitsmlUsername = witsmlUsername,
                SourceServer = witsmlSource.Host?.ToString(),
                TargetServer = witsmlTarget.Host?.ToString()
            };
            return Results.Ok(await jobService.CreateJob(jobType, jobInfo, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByAuthorizedUser(IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            string bearerAuth = httpRequest.Headers["Authorization"];
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            (string userPrincipalName, _) = credentialsService.GetUsernamesFromHeaderValues(bearerAuth, basicAuth);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            if (!useOAuth2 && !credentialsService.ValidEncryptedBasicCredentials(basicAuth))
            {
                return Results.Unauthorized();
            }
            return Results.Ok(jobCache.GetJobInfosByUser(userPrincipalName));
        }

    }
}
