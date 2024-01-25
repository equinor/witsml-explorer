using System.Collections.Generic;
using System.Linq;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class FluidsReport : ObjectOnWellbore
    {
        public string DTim { get; init; }
        public MeasureWithDatum Md { get; init; }
        public MeasureWithDatum Tvd { get; init; }
        public string NumReport { get; init; }
        public List<Fluid> Fluids { get; set; }
        public CommonData CommonData { get; init; }

        public override WitsmlFluidsReports ToWitsml()
        {
            return new WitsmlFluidsReport
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                DTim = StringHelpers.ToUniversalDateTimeString(DTim),
                Md = Md?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                Tvd = Tvd?.ToWitsml<WitsmlWellVerticalDepthCoord>(),
                NumReport = NumReport,
                Fluids = Fluids?.Select(fluid => fluid?.ToWitsml())?.ToList(),
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }
    }
}
