using System;
using System.Collections.Generic;
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
    public class CopyTrajectoryStationsWorker : BaseWorker<CopyTrajectoryStationsJob>, IWorker
    {
        public JobType JobType => JobType.CopyTrajectoryStations;

        public CopyTrajectoryStationsWorker(ILogger<CopyTrajectoryStationsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTrajectoryStationsJob job)
        {
            (WitsmlTrajectory targetTrajectory, IEnumerable<WitsmlTrajectoryStation> stationsToCopy) = await FetchData(job);
            if (stationsToCopy.Count() != job.Source.ComponentUids.Length)
            {
                string errorMessage = "Failed to copy trajectory stations.";
                string missingUids = string.Join(", ", stationsToCopy.Select((ts) => ts.Uid).Where((uid) => !job.Source.ComponentUids.Contains(uid)));
                string reason = $"Could not retrieve all trajectory stations, missing uids: {missingUids}.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, reason, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, reason), null);
            }
            WitsmlTrajectories updatedTrajectoryQuery = TrajectoryQueries.CopyTrajectoryStations(targetTrajectory, stationsToCopy);
            QueryResult copyResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(updatedTrajectoryQuery);
            string trajectoryStationsString = string.Join(", ", job.Source.ComponentUids);
            if (!copyResult.IsSuccessful)
            {
                string errorMessage = "Failed to copy trajectory stations.";
                Logger.LogError("{errorMessage} {reason} - {description}", errorMessage, copyResult.Reason, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, copyResult.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Trajectory, job.Target.Uid);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"TrajectoryStations {trajectoryStationsString} copied to: {targetTrajectory.Name}");

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlTrajectory, IEnumerable<WitsmlTrajectoryStation>>> FetchData(CopyTrajectoryStationsJob job)
        {
            Task<WitsmlTrajectory> targetTrajectoryQuery = GetTrajectory(GetTargetWitsmlClientOrThrow(), job.Target);
            Task<IEnumerable<WitsmlTrajectoryStation>> sourceTrajectoryStationsQuery = GetTrajectoryStations(GetSourceWitsmlClientOrThrow(), job.Source.Parent, job.Source.ComponentUids);
            await Task.WhenAll(targetTrajectoryQuery, sourceTrajectoryStationsQuery);
            WitsmlTrajectory targetTrajectory = await targetTrajectoryQuery;
            IEnumerable<WitsmlTrajectoryStation> sourceTrajectoryStations = await sourceTrajectoryStationsQuery;
            return Tuple.Create(targetTrajectory, sourceTrajectoryStations);
        }

        private static async Task<WitsmlTrajectory> GetTrajectory(IWitsmlClient client, ObjectReference trajectoryReference)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoryById(trajectoryReference.WellUid, trajectoryReference.WellboreUid, trajectoryReference.Uid);
            WitsmlTrajectories result = await client.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));
            return !result.Trajectories.Any() ? null : result.Trajectories.First();
        }

        private static async Task<IEnumerable<WitsmlTrajectoryStation>> GetTrajectoryStations(IWitsmlClient client, ObjectReference trajectoryReference, IEnumerable<string> trajectoryStationsUids)
        {
            WitsmlTrajectory witsmlTrajectory = await GetTrajectory(client, trajectoryReference);
            return witsmlTrajectory?.TrajectoryStations.FindAll((WitsmlTrajectoryStation tc) => trajectoryStationsUids.Contains(tc.Uid));
        }
    }
}
