
using System;

using Microsoft.AspNetCore.Http;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public interface IEssentialHeaders
    {
        public string Authorization { get; }
        public bool HasCookieCredentials(string server);
        public string GetCookie(string server);
        public string GetHost(string server);
        public string GetBearerToken();
    }

    public class EssentialHeaders : IEssentialHeaders
    {
        public static readonly string WitsmlTargetServer = "WitsmlTargetServer";
        public static readonly string WitsmlSourceServer = "WitsmlSourceServer";
        public EssentialHeaders() { }
        public EssentialHeaders(HttpRequest httpRequest)
        {

            Authorization = httpRequest?.Headers["Authorization"];
            TargetServer = httpRequest?.Headers[WitsmlTargetServer];
            SourceServer = httpRequest?.Headers[WitsmlSourceServer];
            TargetServerCookie = httpRequest?.Cookies[Uri.EscapeDataString(TargetServer)];
            SourceServerCookie = httpRequest?.Cookies[Uri.EscapeDataString(SourceServer)];
        }
        public string Authorization { get; init; }
        private string TargetServer { get; init; }
        private string SourceServer { get; init; }
        private string TargetServerCookie { get; init; }
        private string SourceServerCookie { get; init; }

        public bool HasCookieCredentials(string server)
        {
            return (server == WitsmlTargetServer) ? !string.IsNullOrEmpty(TargetServerCookie) : !string.IsNullOrEmpty(SourceServerCookie);
        }
        public string GetCookie(string server)
        {
            return (server == WitsmlTargetServer) ? TargetServerCookie : SourceServerCookie;
        }
        public string GetHost(string server)
        {
            return (server == WitsmlTargetServer) ? TargetServer : SourceServer;
        }
        public string GetBearerToken()
        {
            return Authorization?.Split()[1];
        }
    }
}

