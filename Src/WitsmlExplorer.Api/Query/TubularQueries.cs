using System.Collections.Generic;
using System.Globalization;
using System.Linq;

using Witsml.Data.Measures;
using Witsml.Data.Tubular;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Query
{
    public static class TubularQueries
    {
        public static WitsmlTubulars GetWitsmlTubular(string wellUid, string wellboreUid, string tubularUid = "")
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    NameWell = "",
                    NameWellbore = "",
                    TypeTubularAssy = "",
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

        public static WitsmlTubulars CopyTubularComponents(WitsmlTubular tubular, IEnumerable<WitsmlTubularComponent> tubularComponents)
        {
            tubular.TubularComponents.AddRange(tubularComponents);
            WitsmlTubulars copyTubularQuery = new() { Tubulars = new List<WitsmlTubular> { tubular } };
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

        public static WitsmlTubulars UpdateTubularComponent(TubularComponent tubularComponent, ObjectReference tubularReference)
        {
            WitsmlTubularComponent tc = new()
            {
                Uid = tubularComponent.Uid,
                Sequence = tubularComponent.Sequence,
                TypeTubularComp = tubularComponent.TypeTubularComponent
            };

            if (tubularComponent.Id != null)
            {
                tc.Id = new WitsmlLengthMeasure { Uom = tubularComponent.Id.Uom, Value = tubularComponent.Id.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (tubularComponent.Od != null)
            {
                tc.Od = new WitsmlLengthMeasure { Uom = tubularComponent.Od.Uom, Value = tubularComponent.Od.Value.ToString(CultureInfo.InvariantCulture) };
            }

            if (tubularComponent.Len != null)
            {
                tc.Len = new WitsmlLengthMeasure { Uom = tubularComponent.Len.Uom, Value = tubularComponent.Len.Value.ToString(CultureInfo.InvariantCulture) };
            }

            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = tubularReference.WellUid,
                    UidWellbore = tubularReference.WellboreUid,
                    Uid = tubularReference.Uid,
                    TubularComponents = tc.AsSingletonList()
                }.AsSingletonList()
            };
        }
    }
}
