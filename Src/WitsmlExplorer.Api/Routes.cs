using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.HttpHandler;


namespace WitsmlExplorer.Api
{
    public static class Api
    {
        public static void ConfigureApi(this WebApplication app)
        {
            app.MapGet("/api/witsml-servers", WitsmlServerHandler.GetWitsmlServers).RequireAuthorization();
            app.MapPost("/api/witsml-servers", WitsmlServerHandler.CreateWitsmlServer).RequireAuthorization("admin");
            app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer).RequireAuthorization("admin");
            app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer).RequireAuthorization("admin");

            app.MapGet("/api/wells", WellHandler.GetAllWells).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}", WellHandler.GetWell).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/wbGeometrys", WbGeometryHandler.GetWbGeometries).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo).RequireAuthorization();
            app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog).RequireAuthorization();

            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory).RequireAuthorization();
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations).RequireAuthorization();

            app.MapPost("/api/jobs/{jobType}", JobHandler.CreateJob).RequireAuthorization();
            app.MapPost("/api/jobs/jobinfos", JobHandler.GetJobInfosById).RequireAuthorization();
            app.MapGet("/api/jobs/jobinfos/{username}", JobHandler.GetJobInfosByUser).RequireAuthorization();

            app.MapPost("/api/credentials/authorize", AuthorizeHandler.Authorize).RequireAuthorization();

            if (app.Environment.EnvironmentName == "Development")
            {
                app.MapFallback(() => Results.Redirect("/swagger"));
            }

        }
    }
}
