using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
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
        public static IResult GetUserJobInfo(string jobId, IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            string userName = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername;
            if (!useOAuth2)
            {
                credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            }
            JobInfo job = jobCache.GetJobInfoById(jobId);
            if (job.Username != userName && (!useOAuth2 || !IsAdminOrDeveloper(eh.GetBearerToken())))
            {
                return TypedResults.Forbid();
            }
            return TypedResults.Ok(job);
        }

        private static bool IsAdminOrDeveloper(string token)
        {
            JwtSecurityTokenHandler handler = new();
            JwtSecurityToken jwt = handler.ReadJwtToken(token);
            List<string> userRoles = jwt.Claims.Where(n => n.Type == "roles").Select(n => n.Value).ToList();
            return userRoles.Contains(AuthorizationPolicyRoles.ADMIN) || userRoles.Contains(AuthorizationPolicyRoles.DEVELOPER);
        }

        [Produces(typeof(IEnumerable<JobInfo>))]
        public static IResult GetAllJobInfos(IJobCache jobCache, IConfiguration configuration)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            bool IsDesktopApp = StringHelpers.ToBoolean(configuration[ConfigConstants.IsDesktopApp]);
            if (!useOAuth2 && !IsDesktopApp)
            {
                return TypedResults.Unauthorized();
            }
            return TypedResults.Ok(jobCache.GetAllJobInfos());
        }

        public static IResult CancelJob(string jobId, IJobCache jobCache)
        {
            var job = jobCache.GetAllJobInfos().Where(x => x.Id == jobId).FirstOrDefault();
            if (job != null && job.IsCancelable)
            {
                job.CancellationTokenSource.Cancel();
                return TypedResults.Ok();
            }
            return TypedResults.NotFound();
        }

        [Produces(typeof(BaseReport))]
        public static IResult GetReport(string jobId, IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            string userName = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername;
            if (!useOAuth2)
            {
                credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            }
            JobInfo job = jobCache.GetJobInfoById(jobId);
            if (job.Username != userName && (!useOAuth2 || !IsAdminOrDeveloper(eh.GetBearerToken())))
            {
                return TypedResults.Forbid();
            }
            return TypedResults.Ok(job.Report);
        }

        [Produces("application/octet-stream")]
        public static IResult DownloadFile(string jobId, IJobCache jobCache, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            string userName = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername;
            if (!useOAuth2)
            {
                credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            }
            JobInfo job = jobCache.GetJobInfoById(jobId);
            if (job.Username != userName && (!useOAuth2 || !IsAdminOrDeveloper(eh.GetBearerToken())))
            {
                return TypedResults.Forbid();
            }
            BaseReport report = job.Report;
            byte[] byteArray = System.Text.Encoding.UTF8.GetBytes(report.FileData.FileContent);
            var stream = new MemoryStream(byteArray);
            httpRequest.HttpContext.Response.Headers["Access-Control-Expose-Headers"] = "Content-Disposition";
            return TypedResults.File(stream, "application/octet-stream", report.FileData.FileName);
        }
    }
}
