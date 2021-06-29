using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyTrajectoryWorker : IWorker<CopyTrajectoryJob>
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;

        public CopyTrajectoryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CopyTrajectoryJob job)
        {
            var (trajectory, targetWellbore) = await FetchData(job);
            var trajectoryToCopy = TrajectoryQueries.CopyWitsmlTrajectory(trajectory, targetWellbore);
            var copyLogResult = await witsmlClient.AddToStoreAsync(trajectoryToCopy);
            if (!copyLogResult.IsSuccessful)
            {
                var errorMessage = "Failed to copy trajectory.";
                Log.Error(
                    "{ErrorMessage} Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceTrajectoryUid}. " +
                    "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}.",
                    errorMessage,
                    job.Source.WellUid, job.Source.WellboreUid, job.Source.TrajectoryUid,
                    job.Target.WellUid, job.Target.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyLogResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Trajectory copied", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Trajectory {trajectory.Name} copied to: {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTrajectory, WitsmlWellbore>> FetchData(CopyTrajectoryJob job)
        {
            var trajectoryQuery = GetTrajectory(witsmlSourceClient, job.Source);
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(trajectoryQuery, wellboreQuery);
            var trajectory = await trajectoryQuery;
            var targetWellbore = await wellboreQuery;
            return Tuple.Create(trajectory, targetWellbore);
        }

        private static async Task<WitsmlTrajectory> GetTrajectory(IWitsmlClient client, TrajectoryReference trajectoryReference)
        {
            var witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(trajectoryReference.WellUid, trajectoryReference.WellboreUid, trajectoryReference.TrajectoryUid);
            var result = await client.GetFromStoreAsync(witsmlTrajectory, OptionsIn.All);
            return !result.Trajectories.Any() ? null : result.Trajectories.First();
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(witsmlWellbore, OptionsIn.Requested);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
