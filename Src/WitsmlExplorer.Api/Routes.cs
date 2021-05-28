using System;
using System.Linq;
using System.Threading.Tasks;
using Carter;
using Carter.Request;
using Carter.Response;
using Microsoft.AspNetCore.Http;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api
{
    // ReSharper disable once UnusedMember.Global
    public class Routes : CarterModule
    {
        private readonly ICredentialsService credentialsService;
        private readonly IWellService wellService;
        private readonly IWellboreService wellboreService;
        private readonly ILogObjectService logObjectService;
        private readonly IRigService rigService;
        private readonly ITrajectoryService trajectoryService;
        private readonly IJobService jobService;
        private readonly IMudLogService mudLogService;
        private readonly IRiskService riskService;
        private readonly IFormationmarkerService formationmarkerService;
        private readonly IDocumentRepository<Server, Guid> witsmlServerRepository;

        public Routes(
            ICredentialsService credentialsService,
            IWellService wellService,
            IWellboreService wellboreService,
            ILogObjectService logObjectService,
            IRigService rigService,
            ITrajectoryService trajectoryService,
            IJobService jobService,
            IMudLogService mudLogService,
            IRiskService riskService,
            IFormationmarkerService formationmarkerService,
            IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            this.credentialsService = credentialsService;
            this.wellService = wellService;
            this.wellboreService = wellboreService;
            this.logObjectService = logObjectService;
            this.rigService = rigService;
            this.trajectoryService = trajectoryService;
            this.jobService = jobService;
            this.witsmlServerRepository = witsmlServerRepository;
            this.mudLogService = mudLogService;
            this.riskService = riskService;
            this.formationmarkerService = formationmarkerService;

            Get("/api/witsml-servers", GetWitsmlServers);
            Post("/api/witsml-servers", CreateWitsmlServer);
            Patch("/api/witsml-servers/{witsmlServerId}", UpdateWitsmlServer);
            Delete("/api/witsml-servers/{witsmlServerId}", DeleteWitsmlServer);

            Get("/api/wells", GetAllWells);
            Get("/api/wells/active", GetActiveWellbores);
            Get("/api/wells/{wellUid}", GetWell);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}", GetWellbore);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", GetLogsForWellbore);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", GetLog);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", GetLogCurveInfo);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", GetLogData);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", GetRigsForWellbore);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", GetRig);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", GetTrajectories);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", GetTrajectoryStations);

            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", GetMudLogsForWellbore);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", GetMudLog);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", GetRisksForWellbore);
            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/formationmarkers", GetFormationmarkersForWellbore);

            Post("/api/jobs/{jobType}", CreateJob);
            Post("/api/credentials/authorize", Authorize);
        }

        private async Task GetWitsmlServers(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServers = await witsmlServerRepository.GetDocumentsAsync();
            await httpResponse.AsJson(witsmlServers);
        }

        private async Task CreateWitsmlServer(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServer = await httpRequest.Body.Deserialize<Server>();
            var updatedWitsmlServer = await witsmlServerRepository.CreateDocumentAsync(witsmlServer);
            await httpResponse.AsJson(updatedWitsmlServer);
        }

        private async Task UpdateWitsmlServer(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServerId = httpRequest.RouteValues.As<Guid>("witsmlServerId");
            var patchedServer = await httpRequest.Body.Deserialize<Server>();
            
            var updatedServer = await witsmlServerRepository.UpdateDocumentAsync(witsmlServerId, patchedServer);
            await httpResponse.AsJson(updatedServer);
        }

        private async Task DeleteWitsmlServer(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServerId = httpRequest.RouteValues.As<Guid>("witsmlServerId");
            
            await witsmlServerRepository.DeleteDocumentAsync(witsmlServerId);
            httpResponse.StatusCode = StatusCodes.Status204NoContent;
        }

        private async Task GetAllWells(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var allWells = await wellService.GetWells();
            await httpResponse.AsJson(allWells);
        }

        private async Task GetWell(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var well = await wellService.GetWell(wellUid);
            await httpResponse.AsJson(well);
        }

        private async Task GetWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var wellbore = await wellboreService.GetWellbore(wellUid, wellboreUid);
            await httpResponse.AsJson(wellbore);
        }

        private async Task GetLogsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var logs = await logObjectService.GetLogs(wellUid, wellboreUid);
            await httpResponse.AsJson(logs);
        }

        private async Task GetLog(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var logUid = httpRequest.RouteValues.As<string>("logUid");
            var log = await logObjectService.GetLog(wellUid, wellboreUid, logUid);
            await httpResponse.AsJson(log);
        }

        private async Task GetLogCurveInfo(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var logUid = httpRequest.RouteValues.As<string>("logUid");
            var logCurveInfo = await logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid);
            await httpResponse.AsJson(logCurveInfo);
        }

        private async Task GetLogData(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var logUid = httpRequest.RouteValues.As<string>("logUid");
            if (httpRequest.Query.TryGetValue("mnemonic", out var mnemonics))
            {
                string startIndex = null;
                string endIndex = null;
                bool startIndexIsInclusive = true;
                if (httpRequest.Query.TryGetValue("startIndex", out var startIndexValues)) startIndex = startIndexValues.ToString();
                if (httpRequest.Query.TryGetValue("endIndex", out var endIndexValues)) endIndex = endIndexValues.ToString();
                if (httpRequest.Query.TryGetValue("startIndexIsInclusive", out var startIndexIsInclusiveStringValues))
                    startIndexIsInclusive = bool.Parse(startIndexIsInclusiveStringValues);

                var logData = await logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics.ToList(), startIndexIsInclusive, startIndex, endIndex);
                await httpResponse.AsJson(logData);
            }
            else
            {
                httpResponse.StatusCode = StatusCodes.Status400BadRequest;
                await httpResponse.AsJson("Missing list of mnemonics");
            }
        }

        private async Task GetRigsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var rigs = await rigService.GetRigs(wellUid, wellboreUid);
            await httpResponse.AsJson(rigs);
        }

        private async Task GetRig(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var rigUid = httpRequest.RouteValues.As<string>("rigUid");
            var rig = await rigService.GetRig(wellUid, wellboreUid, rigUid);
            await httpResponse.AsJson(rig);
        }

        private async Task GetTrajectories(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var trajectories = await trajectoryService.GetTrajectories(wellUid, wellboreUid);
            await httpResponse.AsJson(trajectories);
        }

        private async Task GetTrajectoryStations(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var trajectoryUid = httpRequest.RouteValues.As<string>("trajectoryUid");
            var trajectory = await trajectoryService.GetTrajectoryStations(wellUid, wellboreUid, trajectoryUid);
            await httpResponse.AsJson(trajectory);
        }

        private async Task GetMudLogsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var mudLogs = await mudLogService.GetMudLogs(wellUid, wellboreUid);
            await httpResponse.AsJson(mudLogs);
        }
        private async Task GetMudLog(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var mudlogUid = httpRequest.RouteValues.As<string>("mudlogUid");
            var mudLog = await mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid);
            await httpResponse.AsJson(mudLog);
        }

        private async Task GetRisksForWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var risks = await riskService.GetRisks(wellUid, wellboreUid);
            await httpResponse.AsJson(risks);
        }

        private async Task GetFormationmarkersForWellbore(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var risks = await formationmarkerService.GetFormationmarkers(wellUid, wellboreUid);
            await httpResponse.AsJson(risks);
        }

        private async Task GetActiveWellbores(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var active = await wellboreService.GetActiveWellbores();
            await httpResponse.AsJson(active);
        }
        
        private async Task CreateJob(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var jobType = httpRequest.RouteValues.As<JobType>("jobType");
            await jobService.CreateJob(jobType, httpRequest.Body);
        }

        private async Task Authorize(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServer = await httpRequest.Body.Deserialize<Server>();
            var result = await credentialsService.Authorize(witsmlServer.Url);
            await httpResponse.AsJson(result);
        }
    }
}
