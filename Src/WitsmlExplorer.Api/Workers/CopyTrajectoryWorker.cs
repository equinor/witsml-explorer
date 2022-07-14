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

namespace WitsmlExplorer.Api.Workers
{
    public class CopyTrajectoryWorker : BaseWorker<CopyTrajectoryJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        public JobType JobType => JobType.CopyTrajectory;
        private readonly ILogger<CopyTrajectoryWorker> _logger;

        public CopyTrajectoryWorker(ILogger<CopyTrajectoryWorker> logger, IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
            _logger = logger;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTrajectoryJob job)
        {
            var (trajectory, targetWellbore) = await FetchData(job);
            var trajectoryToCopy = TrajectoryQueries.CopyWitsmlTrajectory(trajectory, targetWellbore);
            var result = await witsmlClient.AddToStoreAsync(trajectoryToCopy);
            if (!result.IsSuccessful)
            {
                var errorMessage = "Failed to copy trajectory.";
                _logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, result.Reason), null);
            }

            _logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
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
            var result = await client.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));
            return !result.Trajectories.Any() ? null : result.Trajectories.First();
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
