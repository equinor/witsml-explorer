using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
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

            (ServerCredentials targetCreds, ServerCredentials sourceCreds) = credentialsService.GetWitsmlUsernamesFromCache(eh);
            if (!string.IsNullOrEmpty(eh.TargetServer) && string.IsNullOrEmpty(targetCreds?.UserId))
            {
                throw new WitsmlClientProviderException($"Missing target server credentials", (int)HttpStatusCode.Unauthorized, ServerType.Target);
            }
            if (!string.IsNullOrEmpty(eh.SourceServer) && string.IsNullOrEmpty(sourceCreds?.UserId))
            {
                throw new WitsmlClientProviderException($"Missing source server credentials", (int)HttpStatusCode.Unauthorized, ServerType.Source);
            }
            JobInfo jobInfo = new()
            {
                Username = useOAuth2 ? credentialsService.GetClaimFromToken(eh, "upn") : targetCreds.UserId,
                WitsmlTargetUsername = targetCreds.UserId,
                WitsmlSourceUsername = sourceCreds.UserId,
                SourceServer = eh.SourceServer,
                TargetServer = eh.TargetServer
            };
            return TypedResults.Ok(await jobService.CreateJob(jobType, jobInfo, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetJobInfosByAuthorizedUser(IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            (ServerCredentials targetCreds, _) = credentialsService.GetWitsmlUsernamesFromCache(eh);
            string userName = useOAuth2 ? credentialsService.GetClaimFromToken(eh, "upn") : targetCreds.UserId;
            return TypedResults.Ok(jobCache.GetJobInfosByUser(userName));
        }
    }
}
