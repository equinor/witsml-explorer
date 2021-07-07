using System;
using System.Linq;
using System.Threading;
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
    public interface ICreateMudLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateMudLogJob job);
    }

    public class CreateMudLogWorker : ICreateMudLogWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateMudLogWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateMudLogJob job)
        {
            var mudLog = job.MudLog;
            Verify(mudLog);

            var mudLogToCreate = SetupMudLogToCreate(mudLog);

            var result = await witsmlClient.AddToStoreAsync(mudLogToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilMudLogHasBeenCreated(mudLog);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"MudLog created ({mudLog.Name} [{mudLog.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), mudLog.WellUid, mudLog.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellboreName = mudLog.WellboreName };
            Log.Error($"Job failed. An error occurred when creating MudLog: {job.MudLog.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create MudLog", result.Reason, description), null);        }

        private async Task WaitUntilMudLogHasBeenCreated(MudLog mudLog)
        {
            var isMudLogCreated = false;
            var query = MudLogQueries.QueryById(mudLog.WellUid, mudLog.WellboreUid, mudLog.Uid);
            var maxRetries = 30;
            while (!isMudLogCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created MudLog with name {mudLog.Name} (id={mudLog.Uid})");
                }
                Thread.Sleep(1000);
                var mudLogResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isMudLogCreated = mudLogResult.MudLogs.Any();
            }
        }

        private static WitsmlMudLogs SetupMudLogToCreate(MudLog mudLog)
        {
            var geologyIntervals = mudLog.GeologyInterval.Select( geologyInterval => new WitsmlMudLogGeologyInterval()
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
                CommonTime = new WitsmlCommonTime {
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
                    ObjectGrowing = mudLog.ObjectGrowing,
                    MudLogCompany = mudLog.MudLogCompany,
                    MudLogEngineers = mudLog.MudLogEngineers,
                    StartMd = new WitsmlIndex { Uom = "m", Value = mudLog.StartMd },
                    EndMd = new WitsmlIndex { Uom = "m", Value = mudLog.EndMd },
                    GeologyInterval = geologyIntervals,
                    CommonData = new WitsmlCommonData
                    {
                        DTimCreation = mudLog.CommonData.DTimCreation?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        DTimLastChange = mudLog.CommonData.DTimLastChange?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        ItemState =  mudLog.CommonData.ItemState,
                        SourceName = mudLog.CommonData.SourceName
                    }
                }.AsSingletonList()
            };
        }

        private void Verify(MudLog mudLog)
        {
            if (string.IsNullOrEmpty(mudLog.Uid)) throw new InvalidOperationException($"{nameof(mudLog.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(mudLog.Name)) throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
        }
    }
}
