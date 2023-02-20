using System;
using System.Collections.Generic;
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

        private readonly ICopyUtils _copyUtils;
        public JobType JobType => JobType.CopyTrajectory;

        public CopyTrajectoryWorker(ILogger<CopyTrajectoryJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyUtils copyUtils) : base(witsmlClientProvider, logger)
        {
            _copyUtils = copyUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyTrajectoryJob job)
        {
            (WitsmlTrajectories trajectories, WitsmlWellbore targetWellbore) = await FetchData(job);
            IEnumerable<WitsmlTrajectory> queries = TrajectoryQueries.CopyWitsmlTrajectories(trajectories, targetWellbore);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Trajectories);
            return await _copyUtils.CopyObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction, job.Source.WellUid, job.Source.WellboreUid);
        }

        private async Task<Tuple<WitsmlTrajectories, WitsmlWellbore>> FetchData(CopyTrajectoryJob job)
        {
            Task<WitsmlTrajectories> trajectoriesQuery = GetTrajectories(GetSourceWitsmlClientOrThrow(), job.Source);
            Task<WitsmlWellbore> wellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);
            await Task.WhenAll(trajectoriesQuery, wellboreQuery);
            WitsmlTrajectories trajectories = trajectoriesQuery.Result;
            WitsmlWellbore targetWellbore = wellboreQuery.Result;
            return Tuple.Create(trajectories, targetWellbore);
        }

        private static async Task<WitsmlTrajectories> GetTrajectories(IWitsmlClient client, ObjectReferences trajectoryReferences)
        {
            WitsmlTrajectories witsmlTrajectory = TrajectoryQueries.GetWitsmlTrajectoriesById(trajectoryReferences.WellUid, trajectoryReferences.WellboreUid, trajectoryReferences.ObjectUids);
            return await client.GetFromStoreAsync(witsmlTrajectory, new OptionsIn(ReturnElements.All));
        }
    }
}
