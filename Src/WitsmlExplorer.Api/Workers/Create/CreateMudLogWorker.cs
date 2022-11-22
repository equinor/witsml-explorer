using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateMudLogWorker : BaseWorker<CreateMudLogJob>, IWorker
    {
        public JobType JobType => JobType.CreateMudLog;

        public CreateMudLogWorker(ILogger<CreateMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateMudLogJob job)
        {
            MudLog mudLog = job.MudLog;
            Verify(mudLog);

            WitsmlMudLogs mudLogToCreate = SetupMudLogToCreate(mudLog);

            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(mudLogToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilMudLogHasBeenCreated(mudLog);
                Logger.LogInformation("MudLog created. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"MudLog created ({mudLog.Name} [{mudLog.Uid}])");
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), mudLog.WellUid, mudLog.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellboreName = mudLog.WellboreName };
            string errorMessage = "Failed to create mudLog.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private async Task WaitUntilMudLogHasBeenCreated(MudLog mudLog)
        {
            bool isMudLogCreated = false;
            WitsmlMudLogs query = MudLogQueries.QueryById(mudLog.WellUid, mudLog.WellboreUid, mudLog.Uid);
            int maxRetries = 30;
            while (!isMudLogCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created MudLog with name {mudLog.Name} (id={mudLog.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlMudLogs mudLogResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isMudLogCreated = mudLogResult.MudLogs.Any();
            }
        }

        private static WitsmlMudLogs SetupMudLogToCreate(MudLog mudLog)
        {
            List<WitsmlMudLogGeologyInterval> geologyIntervals = mudLog.GeologyInterval.Select(geologyInterval => new WitsmlMudLogGeologyInterval()
            {
                Uid = geologyInterval.Uid,
                TypeLithology = geologyInterval.TypeLithology,
                MdTop = new WitsmlIndex { Uom = "m", Value = geologyInterval.MdTop },
                MdBottom = new WitsmlIndex { Uom = "m", Value = geologyInterval.MdBottom },
                Lithology = new WitsmlMudLogLithology
                {
                    Uid = geologyInterval.Lithology.Uid,
                    Type = geologyInterval.Lithology.Type,
                    CodeLith = geologyInterval.Lithology.CodeLith,
                    LithPc = new WitsmlIndex { Uom = "%", Value = geologyInterval.Lithology.LithPc }
                },
                CommonTime = new WitsmlCommonTime
                {
                    DTimCreation = geologyInterval.CommonTime.DTimCreation?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    DTimLastChange = geologyInterval.CommonTime.DTimLastChange?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ")
                },
            }).ToList();

            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    Uid = mudLog.Uid,
                    UidWellbore = mudLog.WellboreUid,
                    UidWell = mudLog.WellUid,
                    Name = mudLog.Name,
                    NameWellbore = mudLog.WellboreName,
                    NameWell = mudLog.WellName,
                    ObjectGrowing = mudLog.ObjectGrowing.ToString(),
                    MudLogCompany = mudLog.MudLogCompany,
                    MudLogEngineers = mudLog.MudLogEngineers,
                    StartMd = new WitsmlIndex { Uom = "m", Value = mudLog.StartMd },
                    EndMd = new WitsmlIndex { Uom = "m", Value = mudLog.EndMd },
                    GeologyInterval = geologyIntervals,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = mudLog.CommonData.ItemState,
                        SourceName = mudLog.CommonData.SourceName
                    }
                }.AsSingletonList()
            };
        }

        private static void Verify(MudLog mudLog)
        {
            if (string.IsNullOrEmpty(mudLog.Uid))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(mudLog.Name))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
            }
        }
    }
}
