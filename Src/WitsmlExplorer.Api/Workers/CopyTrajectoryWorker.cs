using System;
using System.Collections.Generic;
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
            var copyTrajectoryQuery = CreateCopyTrajectoryQuery(trajectory, targetWellbore);
            var copyLogResult = await witsmlClient.AddToStoreAsync(copyTrajectoryQuery);
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

        private static WitsmlTrajectories CreateCopyTrajectoryQuery(WitsmlTrajectory trajectory, WitsmlWellbore targetWellbore)
        {
            trajectory.UidWell = targetWellbore.UidWell;
            trajectory.NameWell = targetWellbore.NameWell;
            trajectory.UidWellbore = targetWellbore.Uid;
            trajectory.NameWellbore = targetWellbore.Name;
            trajectory.CustomData ??= new WitsmlCustomData();
            trajectory.CommonData.ItemState = string.IsNullOrEmpty(trajectory.CommonData.ItemState) ? null : trajectory.CommonData.ItemState;
            trajectory.CommonData.SourceName = string.IsNullOrEmpty(trajectory.CommonData.SourceName) ? null : trajectory.CommonData.SourceName;
            var copyTrajectoryQuery = new WitsmlTrajectories { Trajectories = new List<WitsmlTrajectory> { trajectory } };
            return copyTrajectoryQuery;
        }

        private async Task<Tuple<WitsmlTrajectory, WitsmlWellbore>> FetchData(CopyTrajectoryJob job)
        {
            var trajectoryQuery = GetTrajectory(witsmlSourceClient, job.Source);
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(trajectoryQuery, wellboreQuery);
            var log = await trajectoryQuery;
            var targetWellbore = await wellboreQuery;
            return Tuple.Create(log, targetWellbore);
        }

        private static async Task<WitsmlTrajectory> GetTrajectory(IWitsmlClient client, TrajectoryReference trajectoryReference)
        {
            var trajectoryQuery = TrajectoryQueries.QueryById(trajectoryReference.WellUid, trajectoryReference.WellboreUid, trajectoryReference.TrajectoryUid);
            var result = await client.GetFromStoreAsync(trajectoryQuery, OptionsIn.All);
            return !result.Trajectories.Any() ? null : result.Trajectories.First();
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var query = WellboreQueries.QueryByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, OptionsIn.Requested);
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
