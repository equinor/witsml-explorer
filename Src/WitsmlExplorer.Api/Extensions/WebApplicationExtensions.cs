using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace WitsmlExplorer.Api.Extensions
{

    public static class WebApplicationExtensions
    {
        private static readonly string OAuth2Path = "/secure";
        private static readonly string BasicPath = "/api";
        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapGet(OAuth2Path + pattern, handler).RequireAuthorization();
            }
            endpoints.MapGet(BasicPath + pattern, handler);
        }

        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapGet(OAuth2Path + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapGet(BasicPath + pattern, handler);
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapPost(OAuth2Path + pattern, handler).RequireAuthorization();
            }
            endpoints.MapPost(BasicPath + pattern, handler);
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapPost(OAuth2Path + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapPost(BasicPath + pattern, handler);
        }
        public static void MapDelete(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapDelete(OAuth2Path + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapDelete(BasicPath + pattern, handler);
        }

        public static void MapMethods(this IEndpointRouteBuilder endpoints, string pattern, IEnumerable<string> httpMethods, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapMethods(OAuth2Path + pattern, httpMethods, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapMethods(BasicPath + pattern, httpMethods, handler);
        }
    }
}
