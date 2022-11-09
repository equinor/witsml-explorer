using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api
{
    public static class Routes
    {
        public static void ConfigureApi(this WebApplication app, IConfiguration configuration)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);

            app.MapGet("/witsml-servers", WitsmlServerHandler.GetWitsmlServers, useOAuth2);
            app.MapPost("/witsml-servers", WitsmlServerHandler.CreateWitsmlServer, useOAuth2, AuthorizationPolicyRoles.ADMIN);
            app.MapMethods("/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, WitsmlServerHandler.UpdateWitsmlServer, useOAuth2, AuthorizationPolicyRoles.ADMIN);
            app.MapDelete("/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer, useOAuth2, AuthorizationPolicyRoles.ADMIN);

            app.MapGet("/wells", WellHandler.GetAllWells, useOAuth2);
            app.MapGet("/wells/{wellUid}", WellHandler.GetWell, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/risks", RiskHandler.GetRisks, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/tubulars", TubularHandler.GetTubulars, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}", TubularHandler.GetTubular, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/tubulars/{tubularUid}/tubularcomponents", TubularHandler.GetTubularComponents, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/messages", MessageHandler.GetMessages, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", MessageHandler.GetMessage, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/bharuns", BhaRunHandler.GetBhaRuns, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/bharuns/{bhaRunUid}", BhaRunHandler.GetBhaRun, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/rigs", RigHandler.GetRigs, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", RigHandler.GetRig, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/logs", LogHandler.GetLogs, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", LogHandler.GetLog, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", LogHandler.GetLogCurveInfo, useOAuth2);
            app.MapPost("/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", LogHandler.GetLogData, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", MudLogHandler.GetMudLogs, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", MudLogHandler.GetMudLog, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", TrajectoryHandler.GetTrajectories, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}", TrajectoryHandler.GetTrajectory, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", TrajectoryHandler.GetTrajectoryStations, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/wbgeometrys", WbGeometryHandler.GetWbGeometries, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/wbgeometrys/{wbGeometryUid}", WbGeometryHandler.GetWbGeometry, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/wbgeometrys/{wbGeometryUid}/wbgeometrysections", WbGeometryHandler.GetWbGeometrySections, useOAuth2);

            app.MapPost("/jobs/{jobType}", JobHandler.CreateJob, useOAuth2);
            app.MapGet("/jobs/jobinfos", JobHandler.GetJobInfosByAuthorizedUser, useOAuth2);

            app.MapGet("/credentials/authorize", AuthorizeHandler.Authorize, useOAuth2);
            app.MapGet("/credentials/deauthorize", AuthorizeHandler.Deauthorize, useOAuth2);
        }
    }
}
