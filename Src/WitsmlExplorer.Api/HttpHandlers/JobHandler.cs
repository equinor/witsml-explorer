using System.Collections.Generic;
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

            credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            if (!string.IsNullOrEmpty(eh.SourceServer))
            {
                credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Source);
            }
            JobInfo jobInfo = new()
            {
                Username = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername,
                WitsmlTargetUsername = eh.TargetUsername,
                WitsmlSourceUsername = eh.SourceUsername,
                SourceServer = eh.SourceServer,
                TargetServer = eh.TargetServer
            };
            return TypedResults.Ok(await jobService.CreateJob(jobType, jobInfo, httpRequest.Body));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetUserJobInfos(IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            string userName = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername;
            if (!useOAuth2)
            {
                credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            }
            return TypedResults.Ok(jobCache.GetJobInfosByUser(userName));
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetAllJobInfos(IJobCache jobCache, IConfiguration configuration)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            if (!useOAuth2)
            {
                return TypedResults.Unauthorized();
            }
            return TypedResults.Ok(jobCache.GetAllJobInfos());
        }
    }
}
