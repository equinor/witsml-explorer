using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
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
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);

            (ServerCredentials sourceCreds, ServerCredentials targetCreds) = credentialsService.GetWitsmlUsernamesFromCache(eh);

            JobInfo jobInfo = new()
            {
                Username = useOAuth2 ? userPrincipalName : targetCreds.UserId,
                WitsmlTargetUsername = targetCreds.UserId,
                WitsmlSourceUsername = sourceCreds.UserId,
                SourceServer = eh.GetHeaderValue(EssentialHeaders.WitsmlSourceServer),
                TargetServer = eh.GetHeaderValue(EssentialHeaders.WitsmlTargetServer)
            };
            return Results.Ok(await jobService.CreateJob(jobType, jobInfo, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByAuthorizedUser(IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            (string userPrincipalName, string witsmlUserName) = credentialsService.GetUsernamesFromCacheAndToken(eh);

            if ((useOAuth2 && string.IsNullOrEmpty(userPrincipalName)) ||
            (!useOAuth2 && string.IsNullOrEmpty(witsmlUserName)))
            {
                return Results.Unauthorized();
            }
            return useOAuth2 ? Results.Ok(jobCache.GetJobInfosByUser(userPrincipalName)) : Results.Ok(jobCache.GetJobInfosByUser(witsmlUserName));
        }
    }
}
