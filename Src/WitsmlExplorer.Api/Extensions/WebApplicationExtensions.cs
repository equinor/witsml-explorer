using System;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SignalR;

namespace WitsmlExplorer.Api.Extensions
{
    public static class WebApplicationExtensions
    {
        private static readonly string ApiPath = "/api";
        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2)
        {
            var routeHandlerBuilder = endpoints.MapGet(ApiPath + pattern, handler);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization();
            }
        }

        public static void MapGet(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            var routeHandlerBuilder = endpoints.MapGet(ApiPath + pattern, handler);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization(policyNames);
            }
        }

        public static void MapPost(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            var routeHandlerBuilder = endpoints.MapPost(ApiPath + pattern, handler);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization(policyNames);
            }
        }
        public static void MapDelete(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            var routeHandlerBuilder = endpoints.MapDelete(ApiPath + pattern, handler);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization(policyNames);
            }
        }

        public static void MapPatch(this IEndpointRouteBuilder endpoints, string pattern, Delegate handler, bool useOAuth2, params string[] policyNames)
        {
            var routeHandlerBuilder = endpoints.MapPatch(ApiPath + pattern, handler);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization(policyNames);
            }
        }

        public static void MapHub<T>(this IEndpointRouteBuilder endpoints, string pattern, bool useOAuth2, params string[] policyNames) where T : Hub
        {
            var routeHandlerBuilder = endpoints.MapHub<T>(pattern);
            if (useOAuth2)
            {
                routeHandlerBuilder.RequireAuthorization(policyNames);
            }
        }
    }
}
