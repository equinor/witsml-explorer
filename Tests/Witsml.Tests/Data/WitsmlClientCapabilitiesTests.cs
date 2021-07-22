using Witsml.Data;
using Xunit;

namespace Witsml.Tests.Data
{
    public class WitsmlClientCapabilitiesTests
    {
        [Fact]
        public void Serializing_DefaultObjectWithRequiredProperties_ReturnsExpected()
        {
            var expected = @"<capClients version=""1.4.1"" xmlns=""http://www.witsml.org/schemas/1series"">" +
                                  @"<capClient apiVers=""1.4.1"">" +
                                     "<schemaVersion>1.3.1.1,1.4.1.1</schemaVersion>" +
                                   "</capClient>" +
                                 "</capClients>";
            var defaultObject = new WitsmlClientCapabilities();
            var result = defaultObject.ToXml();

            Assert.Equal(expected, result);
        }

        [Fact]
        public void Serializing_WithNameAndDescription_ReturnsExpected()
        {
            var expected = @"<capClients version=""1.4.1"" xmlns=""http://www.witsml.org/schemas/1series"">" +
                                  @"<capClient apiVers=""1.4.1"">" +
                                     "<schemaVersion>1.3.1.1,1.4.1.1</schemaVersion>" +
                                     "<description>Just a test</description>" +
                                     "<name>Witsml Explorer</name>" +
                                   "</capClient>" +
                                 "</capClients>";
            var defaultObject = new WitsmlClientCapabilities
            {
                Name = "Witsml Explorer",
                Description = "Just a test"
            };
            var result = defaultObject.ToXml();

            Assert.Equal(expected, result);
        }
    }
}
