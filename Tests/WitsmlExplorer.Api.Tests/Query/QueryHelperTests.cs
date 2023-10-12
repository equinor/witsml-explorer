using System;
using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Query
{
    public class QueryHelperTests
    {
        private readonly TestWell _well = new()
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
            },
        };

        [Fact]
        public void GetPropertyFromObject_NotSupportedProperty_ReturnsNull()
        {
            object obj = new TestWell { };
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
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "field");
            Assert.Equal("", obj.Field);
        }

        [Fact]
        public void AddPropertyToObject_AddsObjectProperty()
        {
            Assert.Null(_well.CommonData);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "commonData");
            Assert.NotNull(obj.CommonData);
            Assert.IsType<WitsmlCommonData>(obj.CommonData);
        }

        [Fact]
        public void AddPropertyToObject_AddsNestedObject()
        {
            Assert.Null(_well.CommonData);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "commonData.sourceName");
            Assert.Equal("", obj.CommonData.SourceName);
        }

        [Fact]
        public void AddPropertiesToObject_AddsMultipleProperties()
        {
            Assert.Null(_well.Region);
            Assert.Null(_well.CommonData);
            Assert.Null(_well.WellLocation.Longitude);
            Assert.Null(_well.WellLocation.ProjectedX);
            TestWell obj = QueryHelper.AddPropertiesToObject(_well, new List<string> { "region", "commonData.sourceName", "wellLocation.longitude.value", "wellLocation.projectedX" });
            Assert.Equal("", obj.Region);
            Assert.Equal("", obj.CommonData.SourceName);
            Assert.Equal("", obj.WellLocation.Longitude.Value);
            Assert.NotNull(obj.WellLocation.ProjectedX);
            Assert.Null(obj.WellLocation.ProjectedY);
        }

        [Fact]
        public void AddPropertyToObject_AddWithStringValue_AddsValue()
        {
            var value = "fieldValue";
            Assert.Null(_well.Field);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "field", value);
            Assert.Equal(value, obj.Field);
        }

        [Fact]
        public void AddPropertyToObject_AddWithObjectValue_AddsValue()
        {
            var value = new WitsmlCommonData
            {
                SourceName = "sourceName"
            };
            Assert.Null(_well.Field);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "commonData", value);
            Assert.Equal(value, obj.CommonData);
        }

        [Fact]
        public void AddPropertyToObject_AddWithWrongValueType_Throws()
        {
            var value = new WitsmlCommonData { };
            Assert.Throws<ArgumentException>(() => QueryHelper.AddPropertyToObject(_well, "field", value));
        }

        [Fact]
        public void AddPropertyToObject_AddNestedObject_AddsValue()
        {
            var value = "sourceName";
            Assert.Null(_well.CommonData);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "commonData.sourceName", value);
            Assert.Equal(value, obj.CommonData.SourceName);
        }

        [Fact]
        public void AddPropertiesToObject_AddsMultiplePropertiesWithValues()
        {

            List<WellDatum> datumValue = _well.WellDatum;
            _well.WellDatum = null;
            var regionValue = "regionValue";
            var sourceNameValue = "sourceNameValue";
            var longitudeValue = "10";
            Assert.Null(_well.Region);
            Assert.Null(_well.CommonData);
            Assert.Null(_well.WellLocation.Longitude);
            Assert.Null(_well.WellDatum);
            TestWell obj = QueryHelper.AddPropertiesToObject(
                _well,
                new List<string> { "region", "commonData.sourceName", "wellLocation.longitude.value", "wellDatum" },
                new List<object> { regionValue, sourceNameValue, longitudeValue, datumValue }
            );
            Assert.Equal(regionValue, obj.Region);
            Assert.Equal(sourceNameValue, obj.CommonData.SourceName);
            Assert.Equal(longitudeValue, obj.WellLocation.Longitude.Value);
            Assert.Equal(datumValue, obj.WellDatum);
        }

        [Fact]
        public void AddPropertyToObject_OverrideObject_OverridesValue()
        {
            var value = new WitsmlLocation
            {
                Uid = "newLocationUid",
                Latitude = new Measure
                {
                    Value = "63.4279798"
                }
            };
            Assert.NotNull(_well.WellLocation);
            TestWell obj = QueryHelper.AddPropertyToObject(_well, "wellLocation", value);
            Assert.Equal(value, obj.WellLocation);
        }
    }

    class TestWell
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string Field { get; set; }
        public string Region { get; set; }
        public List<WellDatum> WellDatum { get; set; }
        public WitsmlLocation WellLocation { get; set; }
        public WitsmlCommonData CommonData { get; set; }
    }

}
