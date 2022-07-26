using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using Witsml.Data.Measures;
using System.Globalization;

namespace WitsmlExplorer.Api.Workers
{

    public class CreateWbGeometryWorker : BaseWorker<CreateWbGeometryJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.CreateWbGeometry;

        public CreateWbGeometryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateWbGeometryJob job)
        {
            var wbGeometry = job.WbGeometry;
            Verify(wbGeometry);

            var wbGeometryToCreate = SetupWbGeometryToCreate(wbGeometry);

            var result = await witsmlClient.AddToStoreAsync(wbGeometryToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilWbGeometryHasBeenCreated(wbGeometry);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"WbGeometry created ({wbGeometry.Name} [{wbGeometry.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wbGeometry.WellUid, wbGeometry.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellboreName = wbGeometry.WellboreName };
            Log.Error($"Job failed. An error occurred when creating WbGeometry: {job.WbGeometry.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create WbGeometry", result.Reason, description), null);

        }
        private async Task WaitUntilWbGeometryHasBeenCreated(WbGeometry wbGeometry)
        {
            var isCreated = false;
            var query = WbGeometryQueries.QueryById(wbGeometry.WellUid, wbGeometry.WellboreUid, wbGeometry.Uid);
            var maxRetries = 30;
            while (!isCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created WbGeometry with name {wbGeometry.Name} (id={wbGeometry.Uid})");
                }
                Thread.Sleep(1000);
                var wbGeometryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isCreated = wbGeometryResult.WbGeometrys.Any(); //Or WbGeometry
            }
        }

        private static WitsmlWbGeometrys SetupWbGeometryToCreate(WbGeometry wbGeometry)
        {
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new WitsmlWbGeometry
                {
                    WellUid = wbGeometry.WellUid,
                    WellboreUid = wbGeometry.WellboreUid,
                    Uid = wbGeometry.Name,
                    Name = wbGeometry.Name,
                    WellName = wbGeometry.WellName,
                    WellboreName = wbGeometry.WellboreName,
                    DTimReport = wbGeometry.DTimReport?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    MdBottom = wbGeometry.MdBottom != null ? new WitsmlMeasuredDepthCoord { Uom = wbGeometry.MdBottom.Uom, Value = wbGeometry.MdBottom.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    GapAir = wbGeometry.GapAir != null ? new WitsmlLengthMeasure { Uom = wbGeometry.GapAir.Uom, Value = wbGeometry.GapAir.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    DepthWaterMean = wbGeometry.DepthWaterMean != null ? new WitsmlLengthMeasure { Uom = wbGeometry.DepthWaterMean.Uom, Value = wbGeometry.DepthWaterMean.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = wbGeometry.CommonData.ItemState,
                        SourceName = wbGeometry.CommonData.SourceName,
                        Comments = wbGeometry.CommonData.Comments,
                        DTimCreation = wbGeometry.CommonData.DTimCreation?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                        DTimLastChange = wbGeometry.CommonData.DTimLastChange?.ToString("yyyy-MM-ddTHH:mm:ssK.fffZ"),
                    },
                }.AsSingletonList()
            };
        }

        private static void Verify(WbGeometry wbGeometry)
        {
            if (string.IsNullOrEmpty(wbGeometry.Uid)) throw new InvalidOperationException($"{nameof(wbGeometry.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(wbGeometry.Name)) throw new InvalidOperationException($"{nameof(wbGeometry.Name)} cannot be empty");
        }
    }
}
