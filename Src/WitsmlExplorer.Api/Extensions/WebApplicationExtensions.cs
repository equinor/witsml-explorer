using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace WitsmlExplorer.Api.Extensions
{
    public static class WebApplicationExtensions
    {
        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapGet("/api2" + pattern, handler).RequireAuthorization();
            }
            endpoints.MapGet("api" + pattern, handler);
        }

        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapGet("/api2" + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapGet("api" + pattern, handler);
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            if (useOAuth2)
            {
                endpoints.MapPost("/api2" + pattern, handler).RequireAuthorization();
            }
            endpoints.MapPost("api" + pattern, handler);
        }
        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapPost("/api2" + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapPost("api" + pattern, handler);
        }
        public static void MapDelete(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapDelete("/api2" + pattern, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapDelete("api" + pattern, handler);
        }

        public static void MapMethods(this IEndpointRouteBuilder endpoints, string pattern, IEnumerable<string> httpMethods, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            if (useOAuth2)
            {
                endpoints.MapMethods("/api2" + pattern, httpMethods, handler).RequireAuthorization(policyNames);
            }
            endpoints.MapMethods("api" + pattern, httpMethods, handler);
        }
    }
}
