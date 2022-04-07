using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Carter;
using Carter.Response;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api
{
    // ReSharper disable once UnusedMember.Global
    public class Routes : ICarterModule
    {
        private readonly ICredentialsService credentialsService;
        private readonly IJobService jobService;
        private readonly ILogObjectService logObjectService;
        private readonly IMessageObjectService messageObjectService;
        private readonly IRigService rigService;
        private readonly ITrajectoryService trajectoryService;
        private readonly IWellboreService wellboreService;
        private readonly IWellService wellService;
        private readonly IRiskService riskService;
        private readonly IMudLogService mudLogService;
        private readonly IDocumentRepository<Server, Guid> witsmlServerRepository;

        public Routes(
            ICredentialsService credentialsService,
            IWellService wellService,
            IWellboreService wellboreService,
            ILogObjectService logObjectService,
            IMessageObjectService messageObjectService,
            IRigService rigService,
            ITrajectoryService trajectoryService,
            IJobService jobService,
            IRiskService riskService,
            IMudLogService mudLogService,
            IDocumentRepository<Server, Guid> witsmlServerRepository)
        {
            this.credentialsService = credentialsService;
            this.wellService = wellService;
            this.wellboreService = wellboreService;
            this.logObjectService = logObjectService;
            this.messageObjectService = messageObjectService;
            this.rigService = rigService;
            this.trajectoryService = trajectoryService;
            this.jobService = jobService;
            this.riskService = riskService;
            this.mudLogService = mudLogService;
            this.witsmlServerRepository = witsmlServerRepository;


        }


        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/witsml-servers", GetWitsmlServers);
            app.MapPost("/api/witsml-servers", CreateWitsmlServer);
            //MapPatch() extension methods will be available in .Net 7
            app.MapMethods("/api/witsml-servers/{witsmlServerId}", new[] { HttpMethods.Patch }, UpdateWitsmlServer);
            app.MapDelete("/api/witsml-servers/{witsmlServerId}", DeleteWitsmlServer);

            app.MapGet("/api/wells", GetAllWells);
            app.MapGet("/api/wells/{wellUid}", GetWell);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}", GetWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages", GetMessagesForWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/messages/{messageUid}", GetMessage);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}", GetLog);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs", GetLogsForWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logcurveinfo", GetLogCurveInfo);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", GetLogData);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs", GetRigsForWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/rigs/{rigUid}", GetRig);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories", GetTrajectories);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/trajectories/{trajectoryUid}/trajectorystations", GetTrajectoryStations);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/risks", GetRisksForWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs", GetMudLogsForWellbore);
            app.MapGet("/api/wells/{wellUid}/wellbores/{wellboreUid}/mudlogs/{mudlogUid}", GetMudLog);

            //Get Requests exceeding the URL limit
            app.MapPost("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", GetLargeLogData);

            app.MapPost("/api/jobs/{jobType}", CreateJob);
            app.MapPost("/api/credentials/authorize", Authorize);
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
            var witsmlServerId = httpRequest.RouteValues["witsmlServerId"] as Guid? ?? Guid.Empty;
            var patchedServer = await httpRequest.Body.Deserialize<Server>();

            var updatedServer = await witsmlServerRepository.UpdateDocumentAsync(witsmlServerId, patchedServer);
            await httpResponse.AsJson(updatedServer);
        }

        private async Task DeleteWitsmlServer(HttpRequest httpRequest, HttpResponse httpResponse, Guid witsmlServerId)
        {
            await witsmlServerRepository.DeleteDocumentAsync(witsmlServerId);
            httpResponse.StatusCode = StatusCodes.Status204NoContent;
        }

        private async Task GetAllWells(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var allWells = await wellService.GetWells();
            await httpResponse.AsJson(allWells);
        }

        private async Task GetWell(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid)
        {
            var well = await wellService.GetWell(wellUid);
            await httpResponse.AsJson(well);
        }

        private async Task GetWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var wellbore = await wellboreService.GetWellbore(wellUid, wellboreUid);
            await httpResponse.AsJson(wellbore);
        }

        private async Task GetLogsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var logs = await logObjectService.GetLogs(wellUid, wellboreUid);
            await httpResponse.AsJson(logs);
        }

        private async Task GetLog(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string logUid)
        {
            var log = await logObjectService.GetLog(wellUid, wellboreUid, logUid);
            await httpResponse.AsJson(log);
        }

        private async Task GetMessagesForWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var messages = await messageObjectService.GetMessageObjects(wellUid, wellboreUid);
            await httpResponse.AsJson(messages);
        }

        private async Task GetMessage(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string messageUid)
        {
            var message = await messageObjectService.GetMessageObject(wellUid, wellboreUid, messageUid);
            await httpResponse.AsJson(message);
        }

        private async Task GetLogCurveInfo(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string logUid)
        {
            var logCurveInfo = await logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid);
            await httpResponse.AsJson(logCurveInfo);
        }

        private async Task GetLogData(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string logUid)
        {
            if (httpRequest.Query.TryGetValue("mnemonic", out var mnemonics))
            {
                string startIndex = null;
                string endIndex = null;
                var startIndexIsInclusive = true;
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

        private async Task GetLargeLogData(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string logUid)
        {
            var mnemonics = (await httpRequest.ReadFromJsonAsync<IEnumerable<string>>() ?? Array.Empty<string>()).ToList();
            if (mnemonics.Any())
            {
                string startIndex = null;
                string endIndex = null;
                var startIndexIsInclusive = true;
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

        private async Task GetRigsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var rigs = await rigService.GetRigs(wellUid, wellboreUid);
            await httpResponse.AsJson(rigs);
        }

        private async Task GetRig(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string rigUid)
        {
            var rig = await rigService.GetRig(wellUid, wellboreUid, rigUid);
            await httpResponse.AsJson(rig);
        }

        private async Task GetTrajectories(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var trajectories = await trajectoryService.GetTrajectories(wellUid, wellboreUid);
            await httpResponse.AsJson(trajectories);
        }

        private async Task GetTrajectoryStations(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string trajectoryUid)
        {
            var trajectory = await trajectoryService.GetTrajectoryStations(wellUid, wellboreUid, trajectoryUid);
            await httpResponse.AsJson(trajectory);
        }
        private async Task GetRisksForWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var risks = await riskService.GetRisks(wellUid, wellboreUid);
            await httpResponse.AsJson(risks);
        }

        private async Task GetMudLogsForWellbore(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid)
        {
            var mudLogs = await mudLogService.GetMudLogs(wellUid, wellboreUid);
            await httpResponse.AsJson(mudLogs);
        }
        private async Task GetMudLog(HttpRequest httpRequest, HttpResponse httpResponse, string wellUid, string wellboreUid, string mudlogUid)
        {
            var mudLog = await mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid);
            await httpResponse.AsJson(mudLog);
        }

        private Task CreateJob(HttpRequest httpRequest, HttpResponse httpResponse, JobType jobType)
        {
            jobService.CreateJob(jobType, httpRequest.Body);
            return Task.CompletedTask;
        }

        private async Task Authorize(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var witsmlServer = await httpRequest.Body.Deserialize<Server>();
            var result = await credentialsService.Authorize(witsmlServer.Url);
            await httpResponse.AsJson(result);
        }


    }
}
