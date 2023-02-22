using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.Configuration;
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

        public static string GenerateToken(HttpRequest request, [FromServices] ICredentialsService credentialsService)
        {
            EssentialHeaders eh = new(request);
            string sub = credentialsService.GetClaimFromToken(eh.GetBearerToken(), "sub");

            SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes("superSecretKey@1"));
            SigningCredentials credentials = new(securityKey, SecurityAlgorithms.HmacSha256);
            Claim[] claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, sub),
            };
            JwtSecurityToken token = new("https://localhost:5000/",
                "https://localhost:5000/",
                claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
