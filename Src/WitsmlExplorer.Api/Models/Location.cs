using System.Collections.Generic;

using System.Linq;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Location
    {
        public string Uid { get; set; }
        public RefNameString WellCrs { get; set; }
        public PlaneAngleMeasure Latitude { get; set; }
        public PlaneAngleMeasure Longitude { get; set; }
        public LengthMeasure Easting { get; set; }
        public LengthMeasure Northing { get; set; }
        public LengthMeasure Westing { get; set; }
        public LengthMeasure Southing { get; set; }
        public LengthMeasure ProjectedX { get; set; }
        public LengthMeasure ProjectedY { get; set; }
        public LengthMeasure LocalX { get; init; }
        public LengthMeasure LocalY { get; init; }

        public static Location FromWitsmlLocation(Witsml.Data.WitsmlLocation witsmlLocation)
        {
            return witsmlLocation == null
                ? null
                : new Location
                {
                    Uid = witsmlLocation.Uid,
                    WellCrs = RefNameString.FromWitsmlRefNameString(witsmlLocation.WellCrs),
                    Latitude = PlaneAngleMeasure.FromWitsml(witsmlLocation.Latitude),
                    Longitude = PlaneAngleMeasure.FromWitsml(witsmlLocation.Longitude),
                    Easting = LengthMeasure.FromWitsml(witsmlLocation.Easting),
                    Northing = LengthMeasure.FromWitsml(witsmlLocation.Northing),
                    Westing = LengthMeasure.FromWitsml(witsmlLocation.Westing),
                    Southing = LengthMeasure.FromWitsml(witsmlLocation.Southing),
                    ProjectedX = LengthMeasure.FromWitsml(witsmlLocation.ProjectedX),
                    ProjectedY = LengthMeasure.FromWitsml(witsmlLocation.ProjectedY),
                    LocalX = LengthMeasure.FromWitsml(witsmlLocation.LocalY),
                    LocalY = LengthMeasure.FromWitsml(witsmlLocation.LocalY)
                };
        }

        public static List<Location> FromWitsmlLocation(IEnumerable<Witsml.Data.WitsmlLocation> witsmlLocation)
        {
            return witsmlLocation?.Select(FromWitsmlLocation).ToList() ?? new List<Location>();
        }
    }
}
