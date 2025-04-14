using System.Collections.Generic;
using System.Linq;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Models;
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
            app.MapPatch("/witsml-servers/{witsmlServerId}", WitsmlServerHandler.UpdateWitsmlServer, useOAuth2, AuthorizationPolicyRoles.ADMIN);
            app.MapDelete("/witsml-servers/{witsmlServerId}", WitsmlServerHandler.DeleteWitsmlServer, useOAuth2, AuthorizationPolicyRoles.ADMIN);

            app.MapGet("/capabilities", CapHandler.GetCap, useOAuth2);

            app.MapGet("/wells", WellHandler.GetAllWells, useOAuth2);
            app.MapGet("/wells/{wellUid}", WellHandler.GetWell, useOAuth2);

            app.MapGet("/objects/{objectType}", ObjectHandler.GetObjectsByType, useOAuth2);
            app.MapGet("/objects/{objectType}/{objectProperty}", ObjectHandler.GetObjectsWithParamByType, useOAuth2);
            app.MapGet("/objects/{objectType}/{objectProperty}/{objectPropertyValue}", ObjectHandler.GetObjectsWithParamByType, useOAuth2);

            app.MapGet("/wellbores", WellboreHandler.GetWellbores, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores", WellboreHandler.GetWellbores, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}", WellboreHandler.GetWellbore, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/idonly/{objectType}", ObjectHandler.GetObjectsIdOnly, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/idonly/{objectType}/{objectUid}", ObjectHandler.GetObjectIdOnly, useOAuth2);
            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/countexpandable", ObjectHandler.GetExpandableObjectsCount, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/logCurvePriority", LogCurvePriorityHandler.GetPrioritizedLocalCurves, useOAuth2);
            app.MapGet("/universal/logCurvePriority", LogCurvePriorityHandler.GetPrioritizedUniversalCurves, useOAuth2);
            app.MapPost("/universal/logCurvePriority", LogCurvePriorityHandler.SetPrioritizedUniversalCurves, useOAuth2);
            app.MapPost("/wells/{wellUid}/wellbores/{wellboreUid}/logCurvePriority", LogCurvePriorityHandler.SetPrioritizedLocalCurves, useOAuth2);

            app.MapPost("/uidmapping/", UidMappingHandler.CreateUidMapping, useOAuth2);
            app.MapPatch("/uidmapping/", UidMappingHandler.UpdateUidMapping, useOAuth2);
            app.MapPost("/uidmapping/query/", UidMappingHandler.QueryUidMapping, useOAuth2);
            app.MapGet("/uidmapping/basicinfos/", UidMappingHandler.GetUidMappingBasicInfos, useOAuth2);
            app.MapPost("/uidmapping/deletemapping/", UidMappingHandler.DeleteUidMapping, useOAuth2);
            app.MapDelete("/uidmapping/deletemappings/well/{wellUid}", UidMappingHandler.DeleteUidMappings, useOAuth2);
            app.MapDelete("/uidmapping/deletemappings/well/{wellUid}/wellbore/{wellboreUid}", UidMappingHandler.DeleteUidMappings, useOAuth2);

            app.MapGet("/agent-settings", AgentSettingsHandler.GetAgentSettings, useOAuth2);
            app.MapPost("/agent-settings", AgentSettingsHandler.CreateAgentSettings, useOAuth2);
            app.MapPatch("/agent-settings", AgentSettingsHandler.UpdateAgentSettings, useOAuth2);
            app.MapDelete("/agent-settings", AgentSettingsHandler.DeleteAgentSettings, useOAuth2);

            Dictionary<EntityType, string> types = EntityTypeHelper.ToPluralLowercase();
            Dictionary<EntityType, string> routes = types.ToDictionary(entry => entry.Key, entry => "/wells/{wellUid}/wellbores/{wellboreUid}/" + entry.Value);

            app.MapGet(routes[EntityType.BhaRun], BhaRunHandler.GetBhaRuns, useOAuth2);
            app.MapGet(routes[EntityType.BhaRun] + "/{bhaRunUid}", BhaRunHandler.GetBhaRun, useOAuth2);

            app.MapGet(routes[EntityType.Attachment], AttachmentHandler.GetAttachments, useOAuth2);
            app.MapGet(routes[EntityType.Attachment] + "/{attachmentUid}", AttachmentHandler.GetAttachment, useOAuth2);

            app.MapGet("/wells/{wellUid}/wellbores/{wellboreUid}/changelogs", ChangeLogHandler.GetChangeLogs, useOAuth2);

            app.MapGet(routes[EntityType.FluidsReport], FluidsReportHandler.GetFluidsReports, useOAuth2);
            app.MapGet(routes[EntityType.FluidsReport] + "/{fluidsReportUid}", FluidsReportHandler.GetFluidsReport, useOAuth2);
            app.MapGet(routes[EntityType.FluidsReport] + "/{fluidsReportUid}/" + ComponentType.Fluid.ToPluralLowercase(), FluidsReportHandler.GetFluids, useOAuth2);

            app.MapGet(routes[EntityType.FormationMarker], FormationMarkerHandler.GetFormationMarkers, useOAuth2);
            app.MapGet(routes[EntityType.FormationMarker] + "/{formationMarkerUid}", FormationMarkerHandler.GetFormationMarker, useOAuth2);

            app.MapGet(routes[EntityType.Log], LogHandler.GetLogs, useOAuth2);
            app.MapGet(routes[EntityType.Log] + "/{logUid}", LogHandler.GetLog, useOAuth2);
            app.MapGet(routes[EntityType.Log] + "/{logUid}/" + ComponentType.Mnemonic.ToPluralLowercase(), LogHandler.GetLogCurveInfo, useOAuth2);
            app.MapPost(routes[EntityType.Log] + "/{logUid}/logdata", LogHandler.GetLogData, useOAuth2);
            app.MapPost("/wells/{wellUid}/wellbores/{wellboreUid}/multilog/" + ComponentType.Mnemonic.ToPluralLowercase(), LogHandler.GetMultiLogCurveInfo, useOAuth2);
            app.MapPost("/wells/{wellUid}/wellbores/{wellboreUid}/multilog/logdata", LogHandler.GetMultiLogData, useOAuth2);

            app.MapGet(routes[EntityType.Message], MessageHandler.GetMessages, useOAuth2);
            app.MapGet(routes[EntityType.Message] + "/{messageUid}", MessageHandler.GetMessage, useOAuth2);

            app.MapGet(routes[EntityType.MudLog], MudLogHandler.GetMudLogs, useOAuth2);
            app.MapGet(routes[EntityType.MudLog] + "/{mudlogUid}", MudLogHandler.GetMudLog, useOAuth2);
            app.MapGet(routes[EntityType.MudLog] + "/{mudlogUid}/" + ComponentType.GeologyInterval.ToPluralLowercase(), MudLogHandler.GetGeologyIntervals, useOAuth2);

            app.MapGet(routes[EntityType.Rig], RigHandler.GetRigs, useOAuth2);
            app.MapGet(routes[EntityType.Rig] + "/{rigUid}", RigHandler.GetRig, useOAuth2);

            app.MapGet(routes[EntityType.Risk], RiskHandler.GetRisks, useOAuth2);

            app.MapGet(routes[EntityType.Trajectory], TrajectoryHandler.GetTrajectories, useOAuth2);
            app.MapGet(routes[EntityType.Trajectory] + "/{trajectoryUid}", TrajectoryHandler.GetTrajectory, useOAuth2);
            app.MapGet(routes[EntityType.Trajectory] + "/{trajectoryUid}/" + ComponentType.TrajectoryStation.ToPluralLowercase(), TrajectoryHandler.GetTrajectoryStations, useOAuth2);

            app.MapGet(routes[EntityType.Tubular], TubularHandler.GetTubulars, useOAuth2);
            app.MapGet(routes[EntityType.Tubular] + "/{tubularUid}", TubularHandler.GetTubular, useOAuth2);
            app.MapGet(routes[EntityType.Tubular] + "/{tubularUid}/" + ComponentType.TubularComponent.ToPluralLowercase(), TubularHandler.GetTubularComponents, useOAuth2);

            app.MapGet(routes[EntityType.WbGeometry], WbGeometryHandler.GetWbGeometries, useOAuth2);
            app.MapGet(routes[EntityType.WbGeometry] + "/{wbGeometryUid}", WbGeometryHandler.GetWbGeometry, useOAuth2);
            app.MapGet(routes[EntityType.WbGeometry] + "/{wbGeometryUid}/" + ComponentType.WbGeometrySection.ToPluralLowercase(), WbGeometryHandler.GetWbGeometrySections, useOAuth2);

            app.MapPost("/query/addtostore", WitsmlQueryHandler.AddToStore, useOAuth2);
            app.MapPost("/query/deletefromstore", WitsmlQueryHandler.DeleteFromStore, useOAuth2);
            app.MapPost("/query/getfromstore", WitsmlQueryHandler.GetFromStore, useOAuth2);
            app.MapPost("/query/updateinstore", WitsmlQueryHandler.UpdateInStore, useOAuth2);

            app.MapPost("/jobs/{jobType}", JobHandler.CreateJob, useOAuth2);
            app.MapGet("/jobs/userjobinfos", JobHandler.GetUserJobInfos, useOAuth2);
            app.MapGet("/jobs/userjobinfo/{jobId}", JobHandler.GetUserJobInfo, useOAuth2);
            app.MapGet("/jobs/alljobinfos", JobHandler.GetAllJobInfos, useOAuth2, AuthorizationPolicyRoles.ADMINORDEVELOPER);
            app.MapPost("/jobs/cancel/{jobId}", JobHandler.CancelJob, useOAuth2);
            app.MapGet("/jobs/report/{jobId}", JobHandler.GetReport, useOAuth2);
            app.MapGet("/jobs/download/{jobId}", JobHandler.DownloadFile, useOAuth2);

            app.MapGet("/credentials/authorize", AuthorizeHandler.Authorize, useOAuth2);
            app.MapGet("/credentials/deauthorize", AuthorizeHandler.Deauthorize, useOAuth2);
            app.MapPost("/credentials/verifyuserisloggedin", AuthorizeHandler.VerifyUserIsLoggedIn, useOAuth2);
            if (useOAuth2)
            {
                app.MapGet("/credentials/token", AuthorizeHandler.GenerateToken, useOAuth2);
            }
        }
    }
}
