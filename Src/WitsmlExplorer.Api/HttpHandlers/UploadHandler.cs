using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    // Plain class (not a record): the assembly-wide DI scan would otherwise register it as IEquatable<T>.
    public class CreateUploadRequest
    {
        public string FileName { get; init; }
        public long TotalSize { get; init; }
    }

    public static class UploadHandler
    {
        [Produces(typeof(LogUploadInfo))]
        public static IResult CreateUpload([FromBody] CreateUploadRequest request, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService, ILogUploadService uploadService)
        {
            string owner = GetVerifiedUser(httpRequest, configuration, credentialsService);
            return Execute(() => uploadService.CreateUpload(owner, request?.FileName, request?.TotalSize ?? 0));
        }

        [Produces(typeof(LogUploadInfo))]
        public static async Task<IResult> AppendChunk(string uploadId, [FromQuery] long offset, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService, ILogUploadService uploadService)
        {
            string owner = GetVerifiedUser(httpRequest, configuration, credentialsService);
            try
            {
                return TypedResults.Ok(await uploadService.AppendChunk(uploadId, owner, offset, httpRequest.Body, httpRequest.HttpContext.RequestAborted));
            }
            catch (LogUploadException ex)
            {
                return ToProblem(ex);
            }
        }

        [Produces(typeof(LogUploadInfo))]
        public static IResult GetUpload(string uploadId, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService, ILogUploadService uploadService)
        {
            string owner = GetVerifiedUser(httpRequest, configuration, credentialsService);
            return Execute(() => uploadService.GetUpload(uploadId, owner));
        }

        public static IResult DeleteUpload(string uploadId, HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService, ILogUploadService uploadService)
        {
            string owner = GetVerifiedUser(httpRequest, configuration, credentialsService);
            return Execute(() =>
            {
                uploadService.DeleteUpload(uploadId, owner);
                return true;
            });
        }

        internal static string GetVerifiedUser(HttpRequest httpRequest, IConfiguration configuration, ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpRequest);
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            credentialsService.VerifyUserIsLoggedIn(eh, ServerType.Target);
            return useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "upn") : eh.TargetUsername;
        }

        private static IResult Execute<T>(System.Func<T> action)
        {
            try
            {
                return TypedResults.Ok(action());
            }
            catch (LogUploadException ex)
            {
                return ToProblem(ex);
            }
        }

        private static IResult ToProblem(LogUploadException ex)
        {
            return TypedResults.Json(new ErrorDetails { StatusCode = ex.StatusCode, Message = ex.Message }, statusCode: ex.StatusCode);
        }
    }
}
