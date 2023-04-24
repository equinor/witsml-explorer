using System;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyFormationMarkerWorker : BaseWorker<ModifyFormationMarkerJob>, IWorker
    {
        public JobType JobType => JobType.ModifyFormationMarker;

        public ModifyFormationMarkerWorker(ILogger<ModifyFormationMarkerJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyFormationMarkerJob job)
        {
            FormationMarker formationMarker = job.FormationMarker;
            Verify(formationMarker);
            WitsmlFormationMarkers formationMarkerToUpdate = SetupFormationMarkerToUpdate(formationMarker);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(formationMarkerToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("FormationMarker modified. {jobDescription}", job.Description());
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), formationMarker.WellUid, formationMarker.WellboreUid, RefreshType.Update);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"FormationMarker updated ({formationMarker.Name} [{formationMarker.Uid}])"), refreshAction);

            }
            EntityDescription description = new() { WellboreName = formationMarker.WellboreName };
            const string errorMessage = "Failed to update formationMarker";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static WitsmlFormationMarkers SetupFormationMarkerToUpdate(FormationMarker formationMarker)
        {
            return new()
            {
                FormationMarkers = new()
                {
                    new()
                    {
                        Uid = formationMarker.Uid,
                        UidWellbore = formationMarker.WellboreUid,
                        UidWell = formationMarker.WellUid,
                        Name = formationMarker.Name,
                        MdPrognosed = formationMarker.MdPrognosed?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                        TvdPrognosed = formationMarker.TvdPrognosed?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                        MdTopSample = formationMarker.MdTopSample?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                        TvdTopSample = formationMarker.TvdTopSample?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                        ThicknessBed = formationMarker.ThicknessBed?.ToWitsml<WitsmlLengthMeasure>(),
                        ThicknessApparent = formationMarker.ThicknessApparent?.ToWitsml<WitsmlLengthMeasure>(),
                        ThicknessPerpen = formationMarker.ThicknessPerpen?.ToWitsml<WitsmlLengthMeasure>(),
                        MdLogSample = formationMarker.MdLogSample?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                        TvdLogSample = formationMarker.TvdLogSample?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                        Dip = formationMarker.Dip?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                        DipDirection = formationMarker.DipDirection?.ToWitsml<WitsmlPlaneAngleMeasure>(),
                        Lithostratigraphic = formationMarker.Lithostratigraphic?.ToWitsmlLithostratigraphyStruct(),
                        Chronostratigraphic = formationMarker.Chronostratigraphic?.ToWitsmlChronostratigraphyStruct(),
                        Description = formationMarker.Description,
                        CommonData = new()
                        {
                            ItemState = formationMarker.CommonData?.ItemState
                        }
                    }
                }
            };
        }

        private static void Verify(FormationMarker formationMarker)
        {
            if (formationMarker.Name == "")
            {
                throw new InvalidOperationException($"{nameof(formationMarker.Name)} cannot be empty");
            }

            if (string.IsNullOrEmpty(formationMarker.WellUid))
            {
                throw new InvalidOperationException($"{nameof(formationMarker.WellUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(formationMarker.WellboreUid))
            {
                throw new InvalidOperationException($"{nameof(formationMarker.WellboreUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(formationMarker.Uid))
            {
                throw new InvalidOperationException($"{nameof(formationMarker.Uid)} cannot be empty");
            }
            ModifyUtils.VerifyMeasure(formationMarker.MdPrognosed, nameof(formationMarker.MdPrognosed));
            ModifyUtils.VerifyMeasure(formationMarker.TvdPrognosed, nameof(formationMarker.TvdPrognosed));
            ModifyUtils.VerifyMeasure(formationMarker.MdTopSample, nameof(formationMarker.MdTopSample));
            ModifyUtils.VerifyMeasure(formationMarker.TvdTopSample, nameof(formationMarker.TvdTopSample));
            ModifyUtils.VerifyMeasure(formationMarker.ThicknessBed, nameof(formationMarker.ThicknessBed));
            ModifyUtils.VerifyMeasure(formationMarker.ThicknessApparent, nameof(formationMarker.ThicknessApparent));
            ModifyUtils.VerifyMeasure(formationMarker.ThicknessPerpen, nameof(formationMarker.ThicknessPerpen));
            ModifyUtils.VerifyMeasure(formationMarker.MdLogSample, nameof(formationMarker.MdLogSample));
            ModifyUtils.VerifyMeasure(formationMarker.TvdLogSample, nameof(formationMarker.TvdLogSample));
            ModifyUtils.VerifyMeasure(formationMarker.Dip, nameof(formationMarker.Dip));
            ModifyUtils.VerifyMeasure(formationMarker.DipDirection, nameof(formationMarker.DipDirection));
            if (formationMarker.Lithostratigraphic != null && string.IsNullOrEmpty(formationMarker.Lithostratigraphic.Kind))
            {
                throw new InvalidOperationException($"Kind for {formationMarker.Lithostratigraphic} cannot be empty");
            }
            if (formationMarker.Chronostratigraphic != null && string.IsNullOrEmpty(formationMarker.Chronostratigraphic.Kind))
            {
                throw new InvalidOperationException($"Kind for {formationMarker.Chronostratigraphic} cannot be empty");
            }
        }
    }
}
