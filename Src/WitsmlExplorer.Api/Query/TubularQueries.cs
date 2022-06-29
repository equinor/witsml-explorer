using System.Collections.Generic;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using System.Linq;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Jobs.Common;
using Witsml.Data.Measures;
using System.Globalization;

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

        public static WitsmlTubulars GetWitsmlTubularsById(string wellUid, string wellboreUid, string[] tubularUids)
        {
            return new WitsmlTubulars
            {
                Tubulars = tubularUids.Select((tubularUid) => new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }).ToList()
            };
        }

        public static IEnumerable<WitsmlTubulars> DeleteWitsmlTubulars(string wellUid, string wellboreUid, string[] tubularUids)
        {
            return tubularUids.Select((tubularUid) =>
                new WitsmlTubulars
                {
                    Tubulars = new WitsmlTubular
                    {
                        Uid = tubularUid,
                        UidWell = wellUid,
                        UidWellbore = wellboreUid
                    }.AsSingletonList()
                }
            );
        }

        public static IEnumerable<WitsmlTubulars> CopyWitsmlTubulars(WitsmlTubulars tubulars, WitsmlWellbore targetWellbore)
        {
            return tubulars.Tubulars.Select((tubular) =>
            {
                tubular.UidWell = targetWellbore.UidWell;
                tubular.NameWell = targetWellbore.NameWell;
                tubular.UidWellbore = targetWellbore.Uid;
                tubular.NameWellbore = targetWellbore.Name;
                return new WitsmlTubulars
                {
                    Tubulars = tubular.AsSingletonList()
                };
            });
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

        public static WitsmlTubulars UpdateTubularComponent(TubularComponent tubularComponent, TubularReference tubularReference)
        {
            var tc = new WitsmlTubularComponent
            {
                Uid = tubularComponent.Uid,
                Sequence = tubularComponent.Sequence,
                TypeTubularComp = tubularComponent.TypeTubularComponent
            };

            if (tubularComponent.Id != null)
                tc.Id = new WitsmlLengthMeasure { Uom = tubularComponent.Id.Uom, Value = tubularComponent.Id.Value.ToString(CultureInfo.InvariantCulture) };

            if (tubularComponent.Od != null)
                tc.Od = new WitsmlLengthMeasure { Uom = tubularComponent.Od.Uom, Value = tubularComponent.Od.Value.ToString(CultureInfo.InvariantCulture) };

            if (tubularComponent.Len != null)
                tc.Len = new WitsmlLengthMeasure { Uom = tubularComponent.Len.Uom, Value = tubularComponent.Len.Value.ToString(CultureInfo.InvariantCulture) };

            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = tubularReference.WellUid,
                    UidWellbore = tubularReference.WellboreUid,
                    Uid = tubularReference.TubularUid,
                    TubularComponents = tc.AsSingletonList()
                }.AsSingletonList()
            };
        }
    }
}
