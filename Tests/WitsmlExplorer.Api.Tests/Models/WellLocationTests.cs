using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models;

using Xunit;

using WitsmlMeasure = Witsml.Data.Measures.Measure;

namespace WitsmlExplorer.Api.Tests.Models
{
    public class WellLocationTests
    {
        [Fact]
        public void FromWitsmlWellLocation_CopiesCorrectly_WhenWellLocationExists()
        {
            var sourceWitsmlLocation = new WitsmlLocation
            {
                Uid = "uid",
                Latitude = new WitsmlPlaneAngleMeasure { Uom = "LatitudeUom", Value = "LatitudeValue" },
                Longitude = new WitsmlPlaneAngleMeasure { Uom = "LongitudeUom", Value = "LongitudeValue" },
                Easting = new WitsmlLengthMeasure { Uom = "EastingUom", Value = "EastingValue" },
                Northing = new WitsmlLengthMeasure { Uom = "NorthingUom", Value = "NorthingValue" },
                LocalX = new WitsmlLengthMeasure { Uom = "LocalXUom", Value = "LocalXValue" },
                LocalY = new WitsmlLengthMeasure { Uom = "LocalYUom", Value = "LocalYValue" },
            };

            var newWellLocation = WellLocation.FromWitsmlLocation(sourceWitsmlLocation);
            Assert.Equal(newWellLocation.Uid, sourceWitsmlLocation.Uid);
            Assert.Equal(newWellLocation.Latitude.Uom, sourceWitsmlLocation.Latitude.Uom);
            Assert.Equal(newWellLocation.Latitude.Value, sourceWitsmlLocation.Latitude.Value);
            Assert.Equal(newWellLocation.Longitude.Uom, sourceWitsmlLocation.Longitude.Uom);
            Assert.Equal(newWellLocation.Longitude.Value, sourceWitsmlLocation.Longitude.Value);
            Assert.Equal(newWellLocation.Easting.Uom, sourceWitsmlLocation.Easting.Uom);
            Assert.Equal(newWellLocation.Easting.Value, sourceWitsmlLocation.Easting.Value);
            Assert.Equal(newWellLocation.Northing.Uom, sourceWitsmlLocation.Northing.Uom);
            Assert.Equal(newWellLocation.Northing.Value, sourceWitsmlLocation.Northing.Value);
            Assert.Equal(newWellLocation.LocalX.Uom, sourceWitsmlLocation.LocalX.Uom);
            Assert.Equal(newWellLocation.LocalX.Value, sourceWitsmlLocation.LocalX.Value);
            Assert.Equal(newWellLocation.LocalY.Uom, sourceWitsmlLocation.LocalY.Uom);
            Assert.Equal(newWellLocation.LocalY.Value, sourceWitsmlLocation.LocalY.Value);
        }

        [Fact]
        public void FromWitsmlWellLocation_ReturnsNull_IfWitsmlLocationIsNull()
        {
            WitsmlLocation sourceWitsmlLocation = null;
            var newWellLocation = WellLocation.FromWitsmlLocation(sourceWitsmlLocation);
            Assert.Null(newWellLocation);

        }
    }
}
