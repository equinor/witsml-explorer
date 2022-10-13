using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateWbGeometryWorker : BaseWorker<CreateWbGeometryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.CreateWbGeometry;

        public CreateWbGeometryWorker(ILogger<CreateWbGeometryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient().Result;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateWbGeometryJob job)
        {
            WbGeometry wbGeometry = job.WbGeometry;
            Verify(wbGeometry);

            WitsmlWbGeometrys wbGeometryToCreate = SetupWbGeometryToCreate(wbGeometry);

            QueryResult result = await _witsmlClient.AddToStoreAsync(wbGeometryToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilWbGeometryHasBeenCreated(wbGeometry);
                Logger.LogInformation("WbGeometry created. {jobDescription}", job.Description());
                WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"WbGeometry created ({wbGeometry.Name} [{wbGeometry.Uid}])");
                RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), wbGeometry.WellUid, wbGeometry.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellboreName = wbGeometry.WellboreName };
            string errorMessage = "Failed to create WbGeometry.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);

        }
        private async Task WaitUntilWbGeometryHasBeenCreated(WbGeometry wbGeometry)
        {
            bool isCreated = false;
            WitsmlWbGeometrys query = WbGeometryQueries.GetWitsmlWbGeometryById(wbGeometry.WellUid, wbGeometry.WellboreUid, wbGeometry.Uid);
            int maxRetries = 30;
            while (!isCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created WbGeometry with name {wbGeometry.Name} (id={wbGeometry.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlWbGeometrys wbGeometryResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isCreated = wbGeometryResult.WbGeometrys.Any(); //Or WbGeometry
            }
        }

        private static WitsmlWbGeometrys SetupWbGeometryToCreate(WbGeometry wbGeometry)
        {
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new WitsmlWbGeometry
                {
                    UidWell = wbGeometry.WellUid,
                    UidWellbore = wbGeometry.WellboreUid,
                    Uid = wbGeometry.Name,
                    Name = wbGeometry.Name,
                    NameWell = wbGeometry.WellName,
                    NameWellbore = wbGeometry.WellboreName,
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
            if (string.IsNullOrEmpty(wbGeometry.Uid))
            {
                throw new InvalidOperationException($"{nameof(wbGeometry.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(wbGeometry.Name))
            {
                throw new InvalidOperationException($"{nameof(wbGeometry.Name)} cannot be empty");
            }
        }
    }
}
