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

        public static WellLocation FromWitsmlLocation(Witsml.Data.WitsmlLocation witsmlLocation)
        {
            if (witsmlLocation == null)
                return null;

            return new WellLocation
            {
                Latitude = WellMeasure.FromWitsmlMeasure(witsmlLocation.Latitude),
                Longitude = WellMeasure.FromWitsmlMeasure(witsmlLocation.Longitude),
                Easting = WellMeasure.FromWitsmlMeasure(witsmlLocation.Easting),
                Northing = WellMeasure.FromWitsmlMeasure(witsmlLocation.Northing),
                LocalX = WellMeasure.FromWitsmlMeasure(witsmlLocation.LocalX),
                LocalY = WellMeasure.FromWitsmlMeasure(witsmlLocation.LocalY)
            };
        }
    }
}
