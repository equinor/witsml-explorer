using System;

using Witsml.ServiceReference;

using Xunit;

namespace Witsml.Tests.ServiceReference
{
    public class EnumMemberHelpersTests
    {
        [Fact]
        public void GetEnumMemberValue_DataOnly_ReturnsCorrectString()
        {
            var enumMemberValue = ReturnElements.DataOnly.GetEnumMemberValue();

            Assert.Equal("data-only", enumMemberValue);
        }

        [Fact]
        public void EnumParser_ValidInputRequested_ReturnsCorrectEnumValue()
        {
            var returnElements = "requested";
            var enumValue = EnumParser<ReturnElements>.GetEnum(returnElements);

            Assert.Equal(ReturnElements.Requested, enumValue);
        }

        [Fact]
        public void EnumParser_InvalidInput_ThrowsArgumentException()
        {
            var invalidInput = "foobar";

            var exception = Assert.Throws<ArgumentException>(() => EnumParser<ReturnElements>.GetEnum(invalidInput));
            Assert.Equal("No members of ReturnElements has a specified EnumMember value of 'foobar'", exception.Message);
        }
    }
}
