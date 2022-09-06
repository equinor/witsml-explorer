using WitsmlExplorer.Api.Models.Measure;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Models.Measure
{
    public class MeasureTests
    {
        [Theory]
        [InlineData("Uom", "Value")]
        [InlineData("null", "")]
        [InlineData(null, null)]
        [InlineData("øæå", "////\\\\")]
        public void FromWitsmlLocation_CopiesCorrectly_WhenWitsmlLocationExists(string uom, string value)
        {
            var sourceWitsmlMeasure = new Witsml.Data.Measures.Measure
            {
                Uom = uom,
                Value = value
            };
            var newWellMeasure = WellMeasure.FromWitsmlMeasure(sourceWitsmlMeasure);
            Assert.Equal(newWellMeasure.Uom, sourceWitsmlMeasure.Uom);
            Assert.Equal(newWellMeasure.Value, sourceWitsmlMeasure.Value);
        }

        [Fact]
        public void FromWitsmlLocation_ReturnsNull_WhenWitsmlLocationIsNull()
        {
            Witsml.Data.Measures.Measure sourceWitsmlMeasure = null;
            var newWellMeasure = WellMeasure.FromWitsmlMeasure(sourceWitsmlMeasure);
            Assert.Null(newWellMeasure);
        }
    }
}
