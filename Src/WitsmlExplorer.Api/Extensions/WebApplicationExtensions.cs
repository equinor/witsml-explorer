using System;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace WitsmlExplorer.Api.Extensions
{

    public static class WebApplicationExtensions
    {
        private static readonly string ApiPath = "/api";
        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapGet(ApiPath + pattern, handler).RequireAuthorization();
            }
            else
            {
                endpoints.MapGet(ApiPath + pattern, handler);
            }
        }

        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapGet(ApiPath + pattern, handler).RequireAuthorization(policyNames);
            }
            else
            {
                endpoints.MapGet(ApiPath + pattern, handler);
            }
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapPost(ApiPath + pattern, handler).RequireAuthorization();
            }
            else
            {
                endpoints.MapPost(ApiPath + pattern, handler);
            }
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapPost(ApiPath + pattern, handler).RequireAuthorization(policyNames);
            }
            else
            {
                endpoints.MapPost(ApiPath + pattern, handler);
            }
        }
        public static void MapDelete(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapDelete(ApiPath + pattern, handler).RequireAuthorization(policyNames);
            }
            else
            {
                endpoints.MapDelete(ApiPath + pattern, handler);
            }
        }

        public static void MapPatch(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapPatch(ApiPath + pattern, handler).RequireAuthorization(policyNames);
            }
            else
            {
                endpoints.MapPatch(ApiPath + pattern, handler);
            }
        }
    }
}
