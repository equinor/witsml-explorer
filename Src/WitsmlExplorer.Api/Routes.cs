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
        app.MapGet("/api/witsml-servers", WitsmlServerHandler.GetWitsmlServers).Produces<IEnumerable<Server>>();
        app.MapPost("/api/witsml-servers", WitsmlServerHandler.CreateWitsmlServer).Produces<Server>();
        app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer);
        app.MapDelete("/api/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer).Produces(StatusCodes.Status204NoContent);

        app.MapGet("/api/wells", WellHandler.GetAllWells).Produces<IEnumerable<Well>>();
        app.MapGet("/api/wells/{wellUid}", WellHandler.GetWell).Produces<Well>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore).Produces<Wellbore>(); ;

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/wbGeometrys", WbGeometryHandler.GetWbGeometries).Produces<IEnumerable<WbGeometry>>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks).Produces<IEnumerable<Risk>>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars).Produces<IEnumerable<Tubular>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular).Produces<Tubular>(); ;
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents).Produces<IEnumerable<TubularComponent>>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages).Produces<IEnumerable<MessageObject>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage).Produces<MessageObject>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns).Produces<IEnumerable<BhaRun>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun).Produces<BhaRun>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs).Produces<IEnumerable<Rig>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig).Produces<Rig>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs).Produces<IEnumerable<LogObject>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog).Produces<LogObject>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo).Produces<IEnumerable<LogCurveInfo>>();
        app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData).Produces<LogData>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs).Produces<IEnumerable<MudLog>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog).Produces<MudLog>();

        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories).Produces<IEnumerable<Trajectory>>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory).Produces<Trajectory>();
        app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations).Produces<IEnumerable<TrajectoryStation>>();

        app.MapPost("/api/jobs/{jobType}", JobHandler.CreateJob).Produces<string>();

        app.MapPost("/api/credentials/authorize", AuthorizeHandler.Authorize).Produces<string>();
    }
}
