using Microsoft.AspNetCore.Http;
namespace WitsmlExplorer.Api.HttpHandlers
{
    public interface IEssentialHeaders
    {

        public string Authorization { get; }
        public string GetCookie();
        public string GetHeaderValue(string witsmlServer);
        public string GetBearerToken();
    }

    public class EssentialHeaders : IEssentialHeaders
    {
        public static readonly string CookieName = "witsmlexplorer";
        public static readonly string WitsmlTargetServer = "WitsmlTargetServer";
        public static readonly string WitsmlSourceServer = "WitsmlSourceServer";

        public EssentialHeaders() { }
        public EssentialHeaders(HttpRequest httpRequest, string environment)
        {

            Authorization = httpRequest?.Headers["Authorization"];
            TargetServer = httpRequest?.Headers[WitsmlTargetServer];
            SourceServer = httpRequest?.Headers[WitsmlSourceServer];
            WitsmlExplorerCookie = httpRequest?.Cookies[$"{CookieName}-{environment}"];
        }
        public string Authorization { get; init; }
        private string TargetServer { get; init; }
        private string SourceServer { get; init; }
        private string WitsmlExplorerCookie { get; init; }


        public string GetCookie()
        {
            return WitsmlExplorerCookie;
        }
        public string GetHeaderValue(string witsmlServer)
        {
            return (witsmlServer == WitsmlTargetServer) ? TargetServer : SourceServer;
        }
        public string GetBearerToken()
        {
            return Authorization?.Split()[1];
        }
    }
}

