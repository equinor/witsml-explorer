using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyTrajectoryWorker : BaseWorker<CopyTrajectoryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        public JobType JobType => JobType.CopyTrajectory;

        public CopyTrajectoryWorker(ILogger<CopyTrajectoryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? _witsmlClient;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTrajectoryJob job)
        {
            (WitsmlTrajectory trajectory, WitsmlWellbore targetWellbore) = await FetchData(job);
            WitsmlTrajectories trajectoryToCopy = TrajectoryQueries.CopyWitsmlTrajectory(trajectory, targetWellbore);
            QueryResult result = await _witsmlClient.AddToStoreAsync(trajectoryToCopy);
            if (!result.IsSuccessful)
            {
                string errorMessage = "Failed to copy trajectory.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Trajectory {trajectory.Name} copied to: {targetWellbore.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTrajectory, WitsmlWellbore>> FetchData(CopyTrajectoryJob job)
        {
            Task<WitsmlTrajectory> trajectoryQuery = GetTrajectory(_witsmlSourceClient, job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(_witsmlClient, job.Target);
            await Task.WhenAll(trajectoryQuery, wellboreQuery);
            WitsmlTrajectory trajectory = await trajectoryQuery;
            WitsmlWellbore targetWellbore = await wellboreQuery;
            return Tuple.Create(trajectory, targetWellbore);
        }

        private static async Task<WitsmlTrajectory> GetTrajectory(IWitsmlClient client, TrajectoryReference trajectoryReference)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(trajectoryReference.WellUid, trajectoryReference.WellboreUid, trajectoryReference.TrajectoryUid);
            WitsmlTrajectories result = await client.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));
            return !result.Trajectories.Any() ? null : result.Trajectories.First();
        }
    }
}
