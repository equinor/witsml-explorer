using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WellLocation
    {
        public WellMeasure Latitude { get; private init; }
        public WellMeasure Longitude { get; private init; }
        public WellMeasure Easting { get; private init; }
        public WellMeasure Northing { get; private init; }
        public WellMeasure LocalX { get; private init; }
        public WellMeasure LocalY { get; private init; }

        public static WellLocation FromWitsmlLocation(WitsmlLocation witsmlLocation)
        {
            return witsmlLocation == null
                ? null
                : new WellLocation
                {
                    Latitude = WellMeasure.FromWitsmlMeasure(witsmlLocation.Latitude),
                    Longitude = WellMeasure.FromWitsmlMeasure(witsmlLocation.Longitude),
                    Easting = WellMeasure.FromWitsmlMeasure(witsmlLocation.Easting),
                    Northing = WellMeasure.FromWitsmlMeasure(witsmlLocation.Northing),
                    LocalX = WellMeasure.FromWitsmlMeasure(witsmlLocation.LocalX),
                    LocalY = WellMeasure.FromWitsmlMeasure(witsmlLocation.LocalY)
                };
        }

        public static List<WellLocation> FromWitsmlLocation(IEnumerable<WitsmlLocation> witsmlLocations)
        {
            return witsmlLocations?.Select(FromWitsmlLocation).ToList() ?? new List<WellLocation>();
        }
    }
}
