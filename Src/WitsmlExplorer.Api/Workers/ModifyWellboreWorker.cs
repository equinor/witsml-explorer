using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyWellboreWorker : BaseWorker<ModifyWellboreJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyWellbore;

        public ModifyWellboreWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellboreJob job)
        {
            Verify(job.Wellbore);

            var witsmlWellbore = WellboreQueries.UpdateWitsmlWellbore(job.Wellbore);
            var result = await witsmlClient.UpdateInStoreAsync(witsmlWellbore);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Wellbore updated ({job.Wellbore.Name} [{job.Wellbore.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Wellbore.WellUid, job.Wellbore.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }
            var updatedWellbores = await witsmlClient.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));
            var updatedWellbore = updatedWellbores.Wellbores.First();
            var description = new EntityDescription
            {
                WellName = updatedWellbore.NameWell,
                WellboreName = updatedWellbore.Name
            };
            Log.Error("Job failed. An error occurred when modifying wellbore: {Wellbore}", job.Wellbore.PrintProperties());
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update wellbore", result.Reason, description), null);
        }

        private static void Verify(Wellbore wellbore)
        {
            if (string.IsNullOrEmpty(wellbore.Uid) || string.IsNullOrEmpty(wellbore.WellUid)) throw new InvalidOperationException($"{nameof(wellbore.Uid)}/{nameof(wellbore.WellUid)} cannot be empty");
            if (wellbore.Name == string.Empty) throw new InvalidOperationException($"{nameof(wellbore.Name)} cannot be empty");
            if (wellbore.Md != null && string.IsNullOrEmpty(wellbore.Md.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.Md)} cannot be empty");
            if (wellbore.Tvd != null && string.IsNullOrEmpty(wellbore.Tvd.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.Tvd)} cannot be empty");
            if (wellbore.MdKickoff != null && string.IsNullOrEmpty(wellbore.MdKickoff.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdKickoff)} cannot be empty");
            if (wellbore.TvdKickoff != null && string.IsNullOrEmpty(wellbore.TvdKickoff.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdKickoff)} cannot be empty");
            if (wellbore.MdPlanned != null && string.IsNullOrEmpty(wellbore.MdPlanned.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdPlanned)} cannot be empty");
            if (wellbore.TvdPlanned != null && string.IsNullOrEmpty(wellbore.TvdPlanned.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdPlanned)} cannot be empty");
            if (wellbore.MdSubSeaPlanned != null && string.IsNullOrEmpty(wellbore.MdSubSeaPlanned.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.MdSubSeaPlanned)} cannot be empty");
            if (wellbore.TvdSubSeaPlanned != null && string.IsNullOrEmpty(wellbore.TvdSubSeaPlanned.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.TvdSubSeaPlanned)} cannot be empty");
            if (wellbore.DayTarget != null && string.IsNullOrEmpty(wellbore.DayTarget.Uom)) throw new InvalidOperationException($"unit of measure for {nameof(wellbore.DayTarget)} cannot be empty");
        }
    }
}
