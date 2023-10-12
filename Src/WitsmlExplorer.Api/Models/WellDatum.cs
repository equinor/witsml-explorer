using System.Collections.Generic;
using System.Linq;

namespace WitsmlExplorer.Api.Models
{
    public record WellDatum
    {
        public string Name { get; private init; }
        public string Code { get; private init; }
        public string Elevation { get; private init; }

        public static WellDatum FromWitsmlWellDatum(Witsml.Data.WellDatum witsmlWellDatum)
        {
            return witsmlWellDatum == null
                ? null
                : new WellDatum
                {
                    Name = witsmlWellDatum.Name,
                    Code = witsmlWellDatum.Code,
                    Elevation = witsmlWellDatum.Elevation?.Value,
                };
        }

        public static List<WellDatum> FromWitsmlWellDatum(IEnumerable<Witsml.Data.WellDatum> witsmlWellDatums)
        {
            return witsmlWellDatums?.Select(FromWitsmlWellDatum).ToList() ?? new List<WellDatum>();
        }
    }
}
