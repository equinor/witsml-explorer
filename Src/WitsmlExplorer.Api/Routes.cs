using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandler;

namespace WitsmlExplorer.Api
{
    public static class Routes
    {
        public static void ConfigureApi(this WebApplication app, IConfiguration configuration)
        {
            app.MapGet("/api/witsml-servers", WitsmlServerHandler.GetWitsmlServers).SetupAuthorization(configuration);
            app.MapPost("/api/witsml-servers", WitsmlServerHandler.CreateWitsmlServer).SetupAuthorization(configuration, AuthorizationPolicyRoles.ADMIN);
            app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer).SetupAuthorization(configuration, AuthorizationPolicyRoles.ADMIN);
            app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer).SetupAuthorization(configuration, AuthorizationPolicyRoles.ADMIN);

            app.MapGet("/api/wells", WellHandler.GetAllWells).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}", WellHandler.GetWell).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/wbGeometrys", WbGeometryHandler.GetWbGeometries).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo).SetupAuthorization(configuration);
            app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog).SetupAuthorization(configuration);

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory).SetupAuthorization(configuration);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations).SetupAuthorization(configuration);

            app.MapPost("/api/jobs/{jobType}", JobHandler.CreateJob).SetupAuthorization(configuration);
            app.MapPost("/api/jobs/jobinfos", JobHandler.GetJobInfosById).SetupAuthorization(configuration);
            app.MapGet("/api/jobs/jobinfos/{username}", JobHandler.GetJobInfosByUser).SetupAuthorization(configuration);

            app.MapPost("/api/credentials/authorize", AuthorizeHandler.Authorize).SetupAuthorization(configuration);

            if (app.Environment.EnvironmentName == "Development")
            {
                app.MapFallback(() => Results.Redirect("/swagger"));
            }

        }
    }
}
