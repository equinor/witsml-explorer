using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Query
{
    public class QueryHelperTests
    {
        private readonly WitsmlWell _well = new()
        {
            Uid = "uid",
            Name = "name",
            WellLocation = new WitsmlLocation
            {
                Uid = "locationUid",
                Latitude = new Measure
                {
                    Value = "63.4279799"
                }
            },
            WellDatum = new List<WellDatum>
            {
                new WellDatum
                {
                    Uid = "wellDatumUid",
                    Name = "wellDatumName"
                }
            }
        };

        [Fact]
        public void GetPropertyFromObject_NotSupportedProperty_ReturnsNull()
        {
            object obj = new WitsmlWell { };
            object objPropertyValue = QueryHelper.GetPropertyFromObject(obj, "undefinedProperty");
            Assert.Null(objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_NullObject_ReturnsNull()
        {
            object obj = null;
            object objPropertyValue = QueryHelper.GetPropertyFromObject(obj, "undefinedProperty");
            Assert.Null(objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_StringProperty_ReturnsValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "name");
            Assert.Equal(_well.Name, objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_ListProperty_ReturnsValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "wellDatum");
            Assert.Equal(_well.WellDatum, objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_ObjectProperty_ReturnsValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "commonData");
            Assert.Equal(_well.CommonData, objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_NestedObjectProperty_ReturnsValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "wellLocation.uid");
            Assert.Equal(_well.WellLocation.Uid, objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_NestedObjectProperty_ReturnsObjectValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "wellLocation.latitude");
            Assert.Equal(_well.WellLocation.Latitude, objPropertyValue);
        }

        [Fact]
        public void GetPropertyFromObject_DeepNestedObjectProperty_ReturnsValue()
        {
            object objPropertyValue = QueryHelper.GetPropertyFromObject(_well, "wellLocation.latitude.value");
            Assert.Equal(_well.WellLocation.Latitude.Value, objPropertyValue);
        }

        [Fact]
        public void AddPropertyToObject_UnnsuportedProperty_Throws()
        {
            Assert.Throws<ArgumentException>(() => QueryHelper.AddPropertyToObject(_well, "unsupportedProperty"));
        }

        [Fact]
        public void AddPropertyToObject_AddsStringProperty()
        {
            Assert.Null(_well.Field);
            WitsmlWell obj = QueryHelper.AddPropertyToObject(_well, "field");
            Assert.Equal("", obj.Field);
        }

        [Fact]
        public void AddPropertyToObject_AddsObjectProperty()
        {
            Assert.Null(_well.CommonData);
            WitsmlWell obj = QueryHelper.AddPropertyToObject(_well, "commonData");
            Assert.NotNull(obj.CommonData);
            Assert.IsType<WitsmlCommonData>(obj.CommonData);
        }

        [Fact]
        public void AddPropertyToObject_AddsNestedObject()
        {
            Assert.Null(_well.CommonData);
            WitsmlWell obj = QueryHelper.AddPropertyToObject(_well, "commonData.sourceName");
            Assert.Equal("", obj.CommonData.SourceName);
        }

        [Fact]
        public void AddPropertiesToObject_AddsMultipleProperties()
        {
            Assert.Null(_well.Region);
            Assert.Null(_well.CommonData);
            Assert.Null(_well.WellLocation.Longitude);
            Assert.Null(_well.WellLocation.ProjectedX);
            WitsmlWell obj = QueryHelper.AddPropertiesToObject(_well, new List<string> { "region", "commonData.sourceName", "wellLocation.longitude.value", "wellLocation.projectedX" });
            Assert.Equal("", obj.Region);
            Assert.Equal("", obj.CommonData.SourceName);
            Assert.Equal("", obj.WellLocation.Longitude.Value);
            Assert.NotNull(obj.WellLocation.ProjectedX);
            Assert.Null(obj.WellLocation.ProjectedY);
        }
    }
}
