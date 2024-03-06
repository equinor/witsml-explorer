using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using Witsml;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromQuery(Name = "keep")] bool keep, [FromServices] ICredentialsService credentialsService, HttpContext httpContext)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            bool success = await credentialsService.VerifyAndCacheCredentials(eh, keep, httpContext);
            if (success)
            {
                return TypedResults.Ok();
            }
            return TypedResults.Unauthorized();
        }

        public static IResult Deauthorize(IConfiguration configuration, HttpContext httpContext, [FromServices] ICredentialsService credentialsService)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            EssentialHeaders eh = new(httpContext?.Request);
            if (!useOAuth2)
            {
                httpContext.Response.Cookies.Delete(EssentialHeaders.CookieName);
            }
            string cacheId = credentialsService.GetCacheId(eh);
            credentialsService.RemoveCachedCredentials(cacheId);

            return TypedResults.Ok();
        }

        public static string GenerateToken(IConfiguration configuration, HttpRequest request, [FromServices] ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(request);
            string sub = credentialsService.GetClaimFromToken(eh.GetBearerToken(), "sub");

            SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes(configuration[ConfigConstants.NotificationsKey]));
            SigningCredentials credentials = new(securityKey, SecurityAlgorithms.HmacSha256);
            Claim[] claims = new[]
            {
                new Claim("sub", sub),
            };
            JwtSecurityToken token = new(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static async Task<IResult> VerifyUserIsLoggedIn(ConnectionInformation connectionInfo, HttpContext httpContext, [FromServices] ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var creds = credentialsService.GetCredentials(eh, connectionInfo.ServerUrl.ToString(), connectionInfo.UserName);
            if (creds == null)
            {
                return TypedResults.Unauthorized();
            }
            try
            {
                await credentialsService.VerifyCredentials(creds);
            }
            catch (Exception)
            {
                return TypedResults.Unauthorized();
            }

            return TypedResults.Ok();
        }
    }
}
