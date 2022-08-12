using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Routez;

namespace WitsmlExplorer.Api;

public static class Api
{
    public static void ConfigureApi(this WebApplication app)
    {
        app.MapGet("/api/witsml-servers", WitsmlServer.GetWitsmlServers);
        app.MapPost("/api/witsml-servers", WitsmlServer.CreateWitsmlServer);
        app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServer.UpdateWitsmlServer);
        app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServer.DeleteWitsmlServer);
    }
}
