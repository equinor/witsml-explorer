using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyWellboreWorker : BaseWorker<ModifyWellboreJob>, IWorker
    {
        public JobType JobType => JobType.ModifyWellbore;

        public ModifyWellboreWorker(ILogger<ModifyWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellboreJob job, CancellationToken? cancellation = null)
        {
            Verify(job.Wellbore);

            WitsmlWellbores witsmlWellbore = WellboreQueries.UpdateWitsmlWellbore(job.Wellbore);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(witsmlWellbore);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Wellbore modified. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Wellbore updated ({job.Wellbore.Name} [{job.Wellbore.Uid}])");
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Wellbore.WellUid, job.Wellbore.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
            WitsmlWellbores updatedWellbores = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));
            WitsmlWellbore updatedWellbore = updatedWellbores.Wellbores.First();
            EntityDescription description = new()
            {
                WellName = updatedWellbore.NameWell,
                WellboreName = updatedWellbore.Name
            };
            const string errorMessage = "Failed to update wellbore";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(Wellbore wellbore)
        {
            if (string.IsNullOrEmpty(wellbore.Uid) || string.IsNullOrEmpty(wellbore.WellUid))
            {
                throw new InvalidOperationException($"{nameof(wellbore.Uid)}/{nameof(wellbore.WellUid)} cannot be empty");
            }

            if (wellbore.Name == string.Empty)
            {
                throw new InvalidOperationException($"{nameof(wellbore.Name)} cannot be empty");
            }

            if (wellbore.Md != null && string.IsNullOrEmpty(wellbore.Md.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.Md)} cannot be empty");
            }

            if (wellbore.Tvd != null && string.IsNullOrEmpty(wellbore.Tvd.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.Tvd)} cannot be empty");
            }

            if (wellbore.MdKickoff != null && string.IsNullOrEmpty(wellbore.MdKickoff.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdKickoff)} cannot be empty");
            }

            if (wellbore.TvdKickoff != null && string.IsNullOrEmpty(wellbore.TvdKickoff.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdKickoff)} cannot be empty");
            }

            if (wellbore.MdPlanned != null && string.IsNullOrEmpty(wellbore.MdPlanned.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdPlanned)} cannot be empty");
            }

            if (wellbore.TvdPlanned != null && string.IsNullOrEmpty(wellbore.TvdPlanned.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdPlanned)} cannot be empty");
            }

            if (wellbore.MdSubSeaPlanned != null && string.IsNullOrEmpty(wellbore.MdSubSeaPlanned.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdSubSeaPlanned)} cannot be empty");
            }

            if (wellbore.TvdSubSeaPlanned != null && string.IsNullOrEmpty(wellbore.TvdSubSeaPlanned.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdSubSeaPlanned)} cannot be empty");
            }

            if (wellbore.DayTarget != null && string.IsNullOrEmpty(wellbore.DayTarget.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {nameof(wellbore.DayTarget)} cannot be empty");
            }

            if (wellbore.Comments == string.Empty)
            {
                throw new InvalidOperationException($"{nameof(wellbore.Comments)} cannot be empty");
            }
        }
    }
}
