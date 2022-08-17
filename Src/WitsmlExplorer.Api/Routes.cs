using System.Collections.Generic;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.HttpHandler;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api;

public static class Api
{
    public static void ConfigureApi(this WebApplication app)
    {
        app.MapGet("/api/witsml-servers", WitsmlServerHandler.GetWitsmlServers);
        app.MapPost("/api/witsml-servers", WitsmlServerHandler.CreateWitsmlServer);
        app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer);
        app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer);

        app.MapGet("/api/wells", WellHandler.GetAllWells);
        app.MapGet("/api/wells/{wellUid}", WellHandler.GetWell);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore).Produces<Wellbore>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/wbGeometrys", WbGeometryHandler.GetWbGeometries).Produces<IEnumerable<WbGeometry>>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks).Produces<IEnumerable<Risk>>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars).Produces<IEnumerable<Tubular>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular).Produces<Tubular>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents).Produces<IEnumerable<TubularComponent>>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages).Produces<IEnumerable<MessageObject>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage).Produces<MessageObject>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns).Produces<IEnumerable<BhaRun>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun).Produces<BhaRun>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs).Produces<IEnumerable<Rig>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig).Produces<Rig>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs).Produces<IEnumerable<LogObject>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog).Produces<LogObject>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo).Produces<IEnumerable<LogCurveInfo>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData).Produces<LogData>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs).Produces<IEnumerable<MudLog>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog).Produces<MudLog>().Produces(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories).Produces<IEnumerable<Trajectory>>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory).Produces<Trajectory>().Produces(StatusCodes.Status500InternalServerError);
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations).Produces<IEnumerable<TrajectoryStation>>().Produces(StatusCodes.Status500InternalServerError);

        app.MapPost("/api/jobs/{jobType}", JobHandler.CreateJob).Produces<string>();

        app.MapPost("/api/credentials/authorize", AuthorizeHandler.Authorize).Produces<string>().Produces(StatusCodes.Status500InternalServerError);

        if (app.Environment.EnvironmentName == "Development")
        {
            app.MapFallback(() => Results.Redirect("/swagger"));
        }
    }
}
