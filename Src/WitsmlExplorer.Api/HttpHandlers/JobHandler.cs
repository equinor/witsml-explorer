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
        public static async Task<IResult> CreateJob(JobType jobType, HttpRequest httpRequest, IConfiguration configuration, IJobService jobService, ICredentialsService credentialsService)
        {

            string bearerAuth = httpRequest.Headers["Authorization"];
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            ServerCredentials witsmlTarget = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlTargetServerHeader, n => "");
            ServerCredentials witsmlSource = httpRequest.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlSourceServerHeader, n => "");
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);

            (string userPrincipalName, string witsmlUsername) = credentialsService.GetUsernamesFromHeaderValues(bearerAuth, basicAuth);
            JobInfo jobInfo = new()
            {
                Username = useOAuth2 ? userPrincipalName : witsmlUsername,
                WitsmlUsername = witsmlUsername,
                SourceServer = witsmlSource.Host?.ToString(),
                TargetServer = witsmlTarget.Host?.ToString()
            };
            return Results.Ok(await jobService.CreateJob(jobType, jobInfo, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByAuthorizedUser(IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            string bearerAuth = httpRequest.Headers["Authorization"];
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            (string userPrincipalName, string witsmlUserName) = credentialsService.GetUsernamesFromHeaderValues(bearerAuth, basicAuth);

            if ((useOAuth2 && string.IsNullOrEmpty(userPrincipalName)) ||
            (!useOAuth2 && string.IsNullOrEmpty(witsmlUserName)))
            {
                return Results.Unauthorized();
            }

            return useOAuth2 ? Results.Ok(jobCache.GetJobInfosByUser(userPrincipalName)) : Results.Ok(jobCache.GetJobInfosByUser(witsmlUserName));
        }

    }
}
