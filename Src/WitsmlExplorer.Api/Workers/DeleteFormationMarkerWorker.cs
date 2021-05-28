using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Query;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteFormationMarkerWorker
    {
        Task<WorkerResult> Execute(DeleteFormationMarkerJob job);
    }

    public class DeleteFormationMarkerWorker: IDeleteFormationMarkerWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteFormationMarkerWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<WorkerResult> Execute(DeleteFormationMarkerJob job)
        {
            var wellUid = job.FormationMarkerReference.WellUid;
            var wellboreUid = job.FormationMarkerReference.WellboreUid;
            var uid = job.FormationMarkerReference.Uid;
           
           var deleteRequest = DeleteRequest(wellUid, wellboreUid, uid); 

            var result = await witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful.", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return workerResult;
            }

            Log.Error("Failed to delete FormationMarker. WellUid: {WellUid}");

            var query = WellQueries.QueryByUid(uid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
            EntityDescription description = null;
            var formationmarker = queryResult.Wells.FirstOrDefault();
            if (formationmarker != null)
            {
                description = new EntityDescription
                {
                    ObjectName = formationmarker.Name
                };
            }

            return new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete FormationMarker", result.Reason, description);


        }
        private static WitsmlFormationMarkers DeleteRequest(string wellUid, string wellboreUid, string uid)
        {
            return new WitsmlFormationMarkers
            {
                FormationMarkers = new WitsmlFormationMarker
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = uid
                }.AsSingletonList()
            };

           
            
        }



    }
}
