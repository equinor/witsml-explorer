using System;
using System.Collections.Generic;
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
        private readonly IBhaRunService bhaRunService;
        private readonly ICredentialsService credentialsService;
        private readonly IJobService jobService;
        private readonly ILogObjectService logObjectService;
        private readonly IMessageObjectService messageObjectService;
        private readonly IRigService rigService;
        private readonly ITrajectoryService trajectoryService;
        private readonly ITubularService tubularService;
        private readonly IWbGeometryService wbGeometryService;
        private readonly IWellboreService wellboreService;
        private readonly IWellService wellService;
        private readonly IRiskService riskService;
        private readonly IMudLogService mudLogService;
        private readonly IDocumentRepository<Server, Guid> witsmlServerRepository;

        public Routes(
            IBhaRunService bhaRunService,
            ICredentialsService credentialsService,
            IWellService wellService,
            IWellboreService wellboreService,
            ILogObjectService logObjectService,
            IMessageObjectService messageObjectService,
            IRigService rigService,
            ITrajectoryService trajectoryService,
            ITubularService tubularService,
            IJobService jobService,
            IRiskService riskService,
            IMudLogService mudLogService,
            IDocumentRepository<Server, Guid> witsmlServerRepository,
            IWbGeometryService wbGeometryService)
        {
            this.bhaRunService = bhaRunService;
            this.credentialsService = credentialsService;
            this.wellService = wellService;
            this.wellboreService = wellboreService;
            this.logObjectService = logObjectService;
            this.messageObjectService = messageObjectService;
            this.rigService = rigService;
            this.trajectoryService = trajectoryService;
            this.tubularService = tubularService;
            this.jobService = jobService;
            this.riskService = riskService;
            this.mudLogService = mudLogService;
            this.witsmlServerRepository = witsmlServerRepository;
            this.wbGeometryService = wbGeometryService;

            Get("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", GetLogData);

            //Get Requests exceeding the URL limit
            Post("/api/wells/{wellUid}/wellbores/{wellboreUid}/logs/{logUid}/logdata", GetLargeLogData);

            Post("/api/jobs/{jobType}", CreateJob);
            //Post("/api/credentials/authorize", Authorize);
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

        private async Task GetLargeLogData(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var wellUid = httpRequest.RouteValues.As<string>("wellUid");
            var wellboreUid = httpRequest.RouteValues.As<string>("wellboreUid");
            var logUid = httpRequest.RouteValues.As<string>("logUid");
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

        private Task CreateJob(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var jobType = httpRequest.RouteValues.As<JobType>("jobType");
            jobService.CreateJob(jobType, httpRequest.Body);
            return Task.CompletedTask;
        }

        // private async Task Authorize(HttpRequest httpRequest, HttpResponse httpResponse)
        // {
        //     var witsmlServer = await httpRequest.Body.Deserialize<Server>();
        //     var result = await credentialsService.Authorize(witsmlServer.Url);
        //     await httpResponse.AsJson(result);
        // }
    }
}
