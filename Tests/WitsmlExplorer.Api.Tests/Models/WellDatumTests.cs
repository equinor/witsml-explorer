using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Models;

using Xunit;

using WitsmlDatum = Witsml.Data.WellDatum;

namespace WitsmlExplorer.Api.Tests.Models
{
    public class WellDatumTests
    {
        [Theory]
        [InlineData("name", "code", "elevation")]
        [InlineData("\\\\\\", "øæå", "\"")]
        [InlineData("", "", "")]
        [InlineData(null, null, null)]
        public void FromWitsmlDatum_CopiesCorrectly_WhenListAndDatumExists(string name, string code, string elevation)
        {
            WitsmlDatum sourceWitsmlDatum = new()
            {
                Name = name,
                Code = code,
                Elevation = new Witsml.Data.Measures.WitsmlMeasureWithDatum { Value = elevation }
            };

            List<WitsmlDatum> sourceWitsmlDatumList = new() { sourceWitsmlDatum };

            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();

            Assert.Equal(newWellDatum.Name, sourceWitsmlDatum.Name);
            Assert.Equal(newWellDatum.Code, sourceWitsmlDatum.Code);
            Assert.Equal(newWellDatum.Elevation, sourceWitsmlDatum.Elevation.Value);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsEmpty()
        {
            List<WitsmlDatum> sourceWitsmlDatumList = new();
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsNull()
        {
            List<WitsmlDatum> sourceWitsmlDatumList = null;
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfWellDatumIsNull()
        {
            WitsmlDatum sourceWitsmlDatum = null;
            List<WitsmlDatum> sourceWitsmlDatumList = new() { sourceWitsmlDatum };
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }
    }
}
