using System;
using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Services;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class StringHelpersTests
    {
        [Fact]
        public void Parse_Boolean_False()
        {
            var invalid = new List<string> { "0", "False", "false", string.Empty, null };
            foreach (string ele in invalid)
            {
                Assert.False(StringHelpers.ToBoolean(ele));
            }
        }

        [Fact]
        public void Parse_Boolean_True()
        {
            var valid = new List<string> { "1", "True", "true" };
            foreach (string ele in valid)
            {
                Assert.True(StringHelpers.ToBoolean(ele));
            }
        }

        [Fact]
        public void Parse_Decimal_InvariantCulture()
        {
            var valid = new List<string> { "1", "1.1" };
            var parsed = new List<decimal> { new decimal(1.0), new decimal(1.1) };

            foreach (var (v, p) in valid.Zip(parsed))
            {
                Assert.Equal(StringHelpers.ToDecimal(v), p);
            }
        }

        [Fact]
        public void Parse_Double_InvariantCulture()
        {
            var valid = new List<string> { "1", "1.1" };
            var parsed = new List<double> { 1.0, 1.1 };

            foreach (var (v, p) in valid.Zip(parsed))
            {
                Assert.Equal(StringHelpers.ToDouble(v), p);
            }
        }

        [Fact]
        public void Parse_DateTime()
        {
            var valid = new List<string> { "2019-12-03T03:21:21.000Z" };
            var parsed = new List<DateTime> { new DateTime(2019, 12, 03, 03, 21, 21, 0, DateTimeKind.Utc) };

            foreach (var (v, p) in valid.Zip(parsed))
            {
                Assert.Equal(StringHelpers.ToDateTime(v)?.ToUniversalTime(), p);
            }
        }

        [Fact]
        public void OptionalBooleanToString_False_CorrectResult()
        {
            Assert.Equal("false", StringHelpers.NullableBooleanToString(false));
        }

        [Fact]
        public void OptionalBooleanToString_True_CorrectResult()
        {
            Assert.Equal("true", StringHelpers.NullableBooleanToString(true));
        }

        [Fact]
        public void OptionalBooleanToString_Null_CorrectResult()
        {
            Assert.Null(StringHelpers.NullableBooleanToString(null));
        }
    }
}
