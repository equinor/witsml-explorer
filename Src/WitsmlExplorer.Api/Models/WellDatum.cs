using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public record WellDatum
    {
        public string Name { get; private init; }
        public string Code { get; private init; }
        public string Elevation { get; private init; }

        public static WellDatum FromWitsmlWellDatum(List<Witsml.Data.WellDatum> witsmlWellDatumList)
        {
            if (witsmlWellDatumList == null || witsmlWellDatumList.Count == 0)
            {
                return null;
            }

            Witsml.Data.WellDatum witsmlWellDatum = witsmlWellDatumList[0];
            return witsmlWellDatum == null
                ? null
                : new WellDatum
                {
                    Name = witsmlWellDatum.Name,
                    Code = witsmlWellDatum.Code,
                    Elevation = witsmlWellDatum.Elevation,
                };
        }
    }
}
