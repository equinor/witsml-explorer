using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyMudLogWorker : BaseWorker<ModifyMudLogJob>, IWorker
    {
        public JobType JobType => JobType.ModifyMudLog;

        public ModifyMudLogWorker(ILogger<ModifyMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMudLogJob job)
        {
            MudLog mudLog = job.MudLog;
            Verify(mudLog);
            WitsmlMudLogs mudLogToUpdate = SetupMudLogToUpdate(mudLog);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(mudLogToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("MudLog modified. {jobDescription}", job.Description());
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), mudLog.WellUid, mudLog.WellboreUid, RefreshType.Update);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"MudLog updated ({mudLog.Name} [{mudLog.Uid}])"), refreshAction);

            }
            EntityDescription description = new() { WellboreName = mudLog.WellboreName };
            const string errorMessage = "Failed to update mudLog";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static WitsmlMudLogs SetupMudLogToUpdate(MudLog mudLog)
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
                    ObjectGrowing = StringHelpers.OptionalBooleanToString(mudLog.ObjectGrowing),
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
            if (string.IsNullOrEmpty(mudLog.Name))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
            }
        }
    }
}
