using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyGeologyIntervalWorker : BaseWorker<ModifyGeologyIntervalJob>, IWorker
    {
        public JobType JobType => JobType.ModifyGeologyInterval;

        public ModifyGeologyIntervalWorker(ILogger<ModifyGeologyIntervalJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyGeologyIntervalJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job.GeologyInterval, job.MudLogReference);

            string wellUid = job.MudLogReference.WellUid;
            string wellboreUid = job.MudLogReference.WellboreUid;
            string mudLogUid = job.MudLogReference.Uid;

            WitsmlMudLogs query = MudLogQueries.UpdateGeologyInterval(job.GeologyInterval, job.MudLogReference);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("GeologyInterval modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.MudLog, mudLogUid);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"GeologyInterval updated ({job.GeologyInterval.Uid})"), refreshAction);
            }

            const string errorMessage = "Failed to update geologyInterval";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            EntityDescription description = new()
            {
                WellName = job.MudLogReference.WellName,
                WellboreName = job.MudLogReference.WellboreName,
                ObjectName = job.MudLogReference.Name
            };
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(MudLogGeologyInterval geologyInterval, ObjectReference mudLogReference)
        {
            if (string.IsNullOrEmpty(mudLogReference.WellUid))
            {
                throw new InvalidOperationException($"{nameof(mudLogReference.WellUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(mudLogReference.WellboreUid))
            {
                throw new InvalidOperationException($"{nameof(mudLogReference.WellboreUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(mudLogReference.Uid))
            {
                throw new InvalidOperationException($"{nameof(mudLogReference.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(geologyInterval.Uid))
            {
                throw new InvalidOperationException($"{nameof(geologyInterval.Uid)} cannot be empty");
            }
            ModifyUtils.VerifyMeasure(geologyInterval.MdTop, nameof(geologyInterval.MdTop));
            ModifyUtils.VerifyMeasure(geologyInterval.MdBottom, nameof(geologyInterval.MdBottom));
            ModifyUtils.VerifyMeasure(geologyInterval.TvdTop, nameof(geologyInterval.TvdTop));
            ModifyUtils.VerifyMeasure(geologyInterval.TvdBase, nameof(geologyInterval.TvdBase));
            ModifyUtils.VerifyMeasure(geologyInterval.RopAv, nameof(geologyInterval.RopAv));
            ModifyUtils.VerifyMeasure(geologyInterval.WobAv, nameof(geologyInterval.WobAv));
            ModifyUtils.VerifyMeasure(geologyInterval.TqAv, nameof(geologyInterval.TqAv));
            ModifyUtils.VerifyMeasure(geologyInterval.CurrentAv, nameof(geologyInterval.CurrentAv));
            ModifyUtils.VerifyMeasure(geologyInterval.RpmAv, nameof(geologyInterval.RpmAv));
            ModifyUtils.VerifyMeasure(geologyInterval.WtMudAv, nameof(geologyInterval.WtMudAv));
            ModifyUtils.VerifyMeasure(geologyInterval.EcdTdAv, nameof(geologyInterval.EcdTdAv));
        }
    }
}
