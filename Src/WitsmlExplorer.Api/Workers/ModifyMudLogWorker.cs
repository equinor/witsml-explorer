using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyMudLogWorker : IWorker<ModifyMudLogJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public ModifyMudLogWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(ModifyMudLogJob job)
        {
            var mudLog = job.MudLog;
            Verify(mudLog);
            var mudLogToUpdate = SetupMudLogToUpdate(mudLog);
            var result = await witsmlClient.UpdateInStoreAsync(mudLogToUpdate);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), mudLog.WellUid, mudLog.WellboreUid, RefreshType.Update);
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"MudLog updated ({mudLog.Name} [{mudLog.Uid}])"), refreshAction);

            }
            var description = new EntityDescription { WellboreName = mudLog.WellboreName };
            Log.Error($"Job failed. An error occurred when modifying mudlog: {job.MudLog.PrintProperties()}");

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update log", result.Reason, description), null);
        }

        private static WitsmlMudLogs SetupMudLogToUpdate(MudLog mudLog)
        {
            var geologyIntervals = mudLog.GeologyInterval.Select(geologyInterval => new WitsmlMudLogGeologyInterval()
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
                        DTimCreation = mudLog.CommonData.DTimCreation?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        DTimLastChange = mudLog.CommonData.DTimLastChange?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        ItemState = mudLog.CommonData.ItemState,
                        SourceName = mudLog.CommonData.SourceName
                    }
                }.AsSingletonList()
            };
        }

        private void Verify(MudLog mudLog)
        {
            if (string.IsNullOrEmpty(mudLog.Name)) throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
        }
    }
}
