using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Trajectory : ObjectOnWellbore
    {
        public MeasureWithDatum MdMin { get; init; }
        public MeasureWithDatum MdMax { get; init; }
        public string AziRef { get; init; }
        public string DTimTrajStart { get; init; }
        public string DTimTrajEnd { get; init; }
        public List<TrajectoryStation> TrajectoryStations { get; init; }
        public string ServiceCompany { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlTrajectories ToWitsml()
        {
            return new WitsmlTrajectory
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                MdMin = MdMin?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                MdMax = MdMax?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                AziRef = AziRef,
                DTimTrajStart = StringHelpers.ToUniversalDateTimeString(DTimTrajStart),
                DTimTrajEnd = StringHelpers.ToUniversalDateTimeString(DTimTrajEnd),
                TrajectoryStations = TrajectoryStations?.Select((trajectoryStation) => trajectoryStation?.ToWitsml()).ToList(),
                ServiceCompany = ServiceCompany,
                CommonData = CommonData?.ToWitsml(),
            }.AsItemInWitsmlList();
        }
    }
}
