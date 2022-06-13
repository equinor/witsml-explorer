using System.Collections.Generic;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using System.Linq;

namespace WitsmlExplorer.Api.Query
{
    public static class TubularQueries
    {
        public static WitsmlTubulars GetWitsmlTubularByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    TypeTubularAssy = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlTubulars GetWitsmlTubularById(string wellUid, string wellboreUid, string tubularUid)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlTubulars CopyWitsmlTubular(WitsmlTubular tubular, WitsmlWellbore targetWellbore)
        {
            tubular.UidWell = targetWellbore.UidWell;
            tubular.NameWell = targetWellbore.NameWell;
            tubular.UidWellbore = targetWellbore.Uid;
            tubular.NameWellbore = targetWellbore.Name;
            var copyTubularQuery = new WitsmlTubulars { Tubulars = new List<WitsmlTubular> { tubular } };
            return copyTubularQuery;
        }

        public static WitsmlTubulars CopyTubularComponents(WitsmlTubular tubular, IEnumerable<WitsmlTubularComponent> tubularComponents)
        {
            tubular.TubularComponents.AddRange(tubularComponents);
            var copyTubularQuery = new WitsmlTubulars { Tubulars = new List<WitsmlTubular> { tubular } };
            return copyTubularQuery;
        }

        public static WitsmlTubulars DeleteTubularComponents(string wellUid, string wellboreUid, string tubularUid, IEnumerable<string> tubularComponentUids)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = tubularUid,
                    TubularComponents = tubularComponentUids.Select(uid => new WitsmlTubularComponent
                    {
                        Uid = uid
                    }).ToList()
                }.AsSingletonList()
            };
        }
    }
}
