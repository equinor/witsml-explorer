using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Models
{
    public class WellDatumTests
    {
        [Theory]
        [InlineData("uid", "name", "code", "elevation")]
        [InlineData("\\\\\\", "\\\\\\", "øæå", "\"")]
        [InlineData("", "", "", "")]
        [InlineData(null, null, null, null)]
        public void FromWitsmlDatum_CopiesCorrectly_WhenListAndDatumExists(string uid, string name, string code, string elevation)
        {
            WitsmlWellDatum sourceWitsmlDatum = new()
            {
                Uid = uid,
                Name = name,
                Code = code,
                Elevation = new Witsml.Data.Measures.WitsmlMeasureWithDatum { Datum = elevation, Value = "1.0" }
            };

            List<WitsmlWellDatum> sourceWitsmlDatumList = new() { sourceWitsmlDatum };

            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();

            Assert.Equal(newWellDatum.Uid, sourceWitsmlDatum.Uid);
            Assert.Equal(newWellDatum.Name, sourceWitsmlDatum.Name);
            Assert.Equal(newWellDatum.Code, sourceWitsmlDatum.Code);
            Assert.Equal(newWellDatum.Elevation.Datum, sourceWitsmlDatum.Elevation.Datum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsEmpty()
        {
            List<WitsmlWellDatum> sourceWitsmlDatumList = new();
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfListIsNull()
        {
            List<WitsmlWellDatum> sourceWitsmlDatumList = null;
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }

        [Fact]
        public void FromWitsmlDatum_ReturnsNullIfWellDatumIsNull()
        {
            WitsmlWellDatum sourceWitsmlDatum = null;
            List<WitsmlWellDatum> sourceWitsmlDatumList = new() { sourceWitsmlDatum };
            WellDatum newWellDatum = WellDatum.FromWitsmlWellDatum(sourceWitsmlDatumList).FirstOrDefault();
            Assert.Null(newWellDatum);
        }
    }
}
