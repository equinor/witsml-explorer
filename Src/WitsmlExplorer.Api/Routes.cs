using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api
{
    public static class Routes
    {
        public static void ConfigureApi(this WebApplication app, IConfiguration configuration)
        {
            bool useOAuth2 = configuration[ConfigConstants.OAuth2Enabled] == "True";

            app.MapGet("/api/witsml-servers", WitsmlServerHandler.GetWitsmlServers).SetupAuthorization(useOAuth2);
            app.MapPost("/api/witsml-servers", WitsmlServerHandler.CreateWitsmlServer).SetupAuthorization(useOAuth2, AuthorizationPolicyRoles.ADMIN);
            app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer).SetupAuthorization(useOAuth2, AuthorizationPolicyRoles.ADMIN);
            app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer).SetupAuthorization(useOAuth2, AuthorizationPolicyRoles.ADMIN);

            app.MapGet("/api/wells", WellHandler.GetAllWells).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}", WellHandler.GetWell).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/wbGeometrys", WbGeometryHandler.GetWbGeometries).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo).SetupAuthorization(useOAuth2);
            app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog).SetupAuthorization(useOAuth2);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory).SetupAuthorization(useOAuth2);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations).SetupAuthorization(useOAuth2);

            app.MapPost("/api/jobs/{jobType}", JobHandler.CreateJob).SetupAuthorization(useOAuth2);
            app.MapPost("/api/jobs/jobinfos", JobHandler.GetJobInfosById).SetupAuthorization(useOAuth2);
            app.MapGet("/api/jobs/jobinfos/{username}", JobHandler.GetJobInfosByUser).SetupAuthorization(useOAuth2);

            app.MapPost("/api/credentials/authorize", AuthorizeHandler.Authorize).SetupAuthorization(useOAuth2);

            if (app.Environment.EnvironmentName == "Development")
            {
                app.MapFallback(() => Results.Redirect("/swagger"));
            }

        }
    }
}
