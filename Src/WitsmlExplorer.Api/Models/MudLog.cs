using System.Collections.Generic;
using System.Linq;

using Witsml.Data.Measures;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class MudLog : ObjectOnWellbore
    {
        public bool ObjectGrowing { get; init; }
        public string MudLogCompany { get; init; }
        public string MudLogEngineers { get; init; }
        public MeasureWithDatum StartMd { get; init; }
        public MeasureWithDatum EndMd { get; init; }
        public List<MudLogGeologyInterval> GeologyInterval { get; set; }
        public CommonData CommonData { get; init; }

        public override WitsmlMudLogs ToWitsml()
        {
            return new WitsmlMudLog
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                ObjectGrowing = StringHelpers.NullableBooleanToString(ObjectGrowing),
                MudLogCompany = MudLogCompany,
                MudLogEngineers = MudLogEngineers,
                StartMd = StartMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                EndMd = EndMd?.ToWitsml<WitsmlMeasureWithDatum>(),
                GeologyInterval = GeologyInterval?.Select(geologyInterval => geologyInterval?.ToWitsml())?.ToList(),
                CommonData = CommonData?.ToWitsml()
            }.AsItemInWitsmlList();
        }
    }
}

