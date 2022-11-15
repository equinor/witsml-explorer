using Microsoft.AspNetCore.Http;
namespace WitsmlExplorer.Api.HttpHandlers
{
    public interface IEssentialHeaders
    {

        public string Authorization { get; }
        public string TargetServer { get; }
        public string SourceServer { get; }
        public string GetCookieValue();
        public string GetBearerToken();

    }

    public class EssentialHeaders : IEssentialHeaders
    {
        public static readonly string CookieName = "witsmlexplorer";
        public static readonly string WitsmlTargetServer = "WitsmlTargetServer";
        public static readonly string WitsmlSourceServer = "WitsmlSourceServer";

        public EssentialHeaders() { }
        public EssentialHeaders(HttpRequest httpRequest)
        {

            Authorization = httpRequest?.Headers["Authorization"];
            TargetServer = httpRequest?.Headers[WitsmlTargetServer];
            SourceServer = httpRequest?.Headers[WitsmlSourceServer];
            WitsmlExplorerCookie = httpRequest?.Cookies[CookieName];
        }
        public string Authorization { get; init; }
        public string TargetServer { get; init; }
        public string SourceServer { get; init; }
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

