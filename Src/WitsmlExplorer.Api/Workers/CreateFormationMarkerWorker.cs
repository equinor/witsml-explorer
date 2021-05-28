using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface ICreateFormationMarkerWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateFormationMarkerJob job);
    }

    public class CreateFormationMarkerWorker : ICreateFormationMarkerWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateFormationMarkerWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateFormationMarkerJob job)
        {
            var formation = job.FormationMarker;
            Verify(formation);

            var formationToCreate = SetupFormationToCreate(formation);

            var result = await witsmlClient.AddToStoreAsync(formationToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilFormationHasBeenCreated(formation);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Formation created ({formation.NameFormation} [{formation.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), formation.UidWell, formation.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { ObjectName = formation.NameFormation };
            Log.Error($"Job failed. An error occurred when creating formation: {job.FormationMarker.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create formation", result.Reason, description), null);
            
        }
        private async Task WaitUntilFormationHasBeenCreated(FormationMarker formation)
        {
            var isCreated = false;
            var query = FormationMarkerQueries.QueryById(formation.UidWell, formation.UidWellbore, formation.Uid);
            var maxRetries = 30;
            while (!isCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created formation with name {formation.NameFormation} (id={formation.Uid})");
                }
                Thread.Sleep(1000);
                var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isCreated = result.FormationMarkers.Any();
            }
        }

        private static WitsmlFormationMarkers SetupFormationToCreate(FormationMarker formation)
        {

            return new WitsmlFormationMarkers
            {
                FormationMarkers = new WitsmlFormationMarker
                {
                    Uid = formation.Uid,
                    UidWellbore = formation.UidWellbore,
                    UidWell = formation.UidWell,
                    NameWell = formation.NameWell,
                    NameWellbore = formation.NameWellbore,
                    Name = formation.NameFormation,
                    MdTopSample = new WitsmlMeasuredDepthCoord { Uom = "m", Value = formation.MdTopSample.ToString() },
                    //TvdTopSample = new WitsmlWellVerticalDepthCoord { Uom = "m", Value = formation.TvdTopSample.ToString() },
                    //Description = formation.Description,
                    CommonData = new WitsmlCommonData
                    {
                        ItemState = formation.CommonData.ItemState,
                        SourceName = formation.CommonData.SourceName,
                        //Comments = formation.CommonData.Comments, 
                        DTimCreation = formation.CommonData.DTimCreation?.ToString("o"),
                        DTimLastChange = formation.CommonData.DTimLastChange?.ToString("o"),
                    },
                }.AsSingletonList()
            };
        }

        private void Verify(FormationMarker formationMarker)
        {
            if (string.IsNullOrEmpty(formationMarker.Uid)) throw new InvalidOperationException($"{nameof(formationMarker.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(formationMarker.NameFormation)) throw new InvalidOperationException($"{nameof(formationMarker.NameFormation)} cannot be empty");
        }
    }
}
