using Microsoft.AspNetCore.Http;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public interface IEssentialHeaders
    {

        public string Authorization { get; }
        public string WitsmlAuth { get; }
        public string TargetServer { get; }
        public string SourceServer { get; }
        public string TargetUsername { get; }
        public string SourceUsername { get; }
        public string GetCookieValue();
        public string GetBearerToken();

    }

    public class EssentialHeaders : IEssentialHeaders
    {
        public static readonly string CookieName = "witsmlexplorer";
        public static readonly string WitsmlAuthHeader = "WitsmlAuth";
        public static readonly string WitsmlTargetServer = "WitsmlTargetServer";
        public static readonly string WitsmlSourceServer = "WitsmlSourceServer";
        public static readonly string WitsmlTargetUsername = "WitsmlTargetUsername";
        public static readonly string WitsmlSourceUsername = "WitsmlSourceUsername";

        public EssentialHeaders() { }
        public EssentialHeaders(HttpRequest httpRequest)
        {

            Authorization = httpRequest?.Headers["Authorization"];
            WitsmlAuth = httpRequest?.Headers[WitsmlAuthHeader];
            TargetServer = httpRequest?.Headers[WitsmlTargetServer];
            SourceServer = httpRequest?.Headers[WitsmlSourceServer];
            TargetUsername = httpRequest?.Headers[WitsmlTargetUsername];
            SourceUsername = httpRequest?.Headers[WitsmlSourceUsername];
            WitsmlExplorerCookie = httpRequest?.Cookies[CookieName];
        }
        public string Authorization { get; init; }
        public string WitsmlAuth { get; init; }
        public string TargetServer { get; init; }
        public string SourceServer { get; init; }
        public string TargetUsername { get; init; }
        public string SourceUsername { get; init; }
        private string WitsmlExplorerCookie { get; init; }


        public string GetCookieValue()
        {
            return WitsmlExplorerCookie;
        }

        public string GetBearerToken()
        {
            return Authorization?.Split()[1];
        }
    }
}

