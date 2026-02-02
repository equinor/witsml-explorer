using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public record WellDatum
    {
        public string Uid { get; init; }
        public string Name { get; private init; }
        public string Code { get; private init; }
        public MeasureWithDatum Elevation { get; private init; }

        public static WellDatum FromWitsmlWellDatum(WitsmlWellDatum witsmlWellDatum)
        {
            return witsmlWellDatum == null
                ? null
                : new WellDatum
                {
                    Uid = witsmlWellDatum.Uid,
                    Name = witsmlWellDatum.Name,
                    Code = witsmlWellDatum.Code,
                    Elevation = MeasureWithDatum.FromWitsml(witsmlWellDatum.Elevation),
                };
        }

        public static List<WellDatum> FromWitsmlWellDatum(IEnumerable<WitsmlWellDatum> witsmlWellDatums)
        {
            return witsmlWellDatums?.Select(FromWitsmlWellDatum).ToList() ?? new List<WellDatum>();
        }
    }
}
