using System.Collections.Generic;

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
            var sourceWitsmlDatum = new WitsmlDatum
            {
                Name = name,
                Code = code,
                Elevation = elevation
            };

            var sourceWitsmlDatumList = new List<WitsmlDatum> { sourceWitsmlDatum };

            var newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList);

            Assert.Equal(newWellDatum.Name, sourceWitsmlDatum.Name);
            Assert.Equal(newWellDatum.Code, sourceWitsmlDatum.Code);
            Assert.Equal(newWellDatum.Elevation, sourceWitsmlDatum.Elevation);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsEmpty()
        {
            var sourceWitsmlDatumList = new List<WitsmlDatum>();
            var newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList);
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsNull()
        {
            List<WitsmlDatum> sourceWitsmlDatumList = null;
            var newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList);
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfWellDatumIsNull()
        {
            WitsmlDatum sourceWitsmlDatum = null;
            var sourceWitsmlDatumList = new List<WitsmlDatum> { sourceWitsmlDatum };
            var newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList);
            Assert.Null(newWellDatum);
        }
    }
}
