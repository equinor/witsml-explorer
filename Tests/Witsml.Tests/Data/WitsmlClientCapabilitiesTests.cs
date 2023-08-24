using Witsml.Data;

using Xunit;

namespace Witsml.Tests.Data
{
    public class WitsmlClientCapabilitiesTests
    {
        [Fact]
        public void ToXml_DefaultObjectWithRequiredProperties_ReturnsExpected()
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
        public void ToXml_WithNameAndDescription_ReturnsExpected()
        {
            var expected = @"<capClients version=""1.4.1"" xmlns=""http://www.witsml.org/schemas/1series"">" +
                                  @"<capClient apiVers=""1.4.1"">" +
                                     "<schemaVersion>1.3.1.1,1.4.1.1</schemaVersion>" +
                                     "<description>Just a test</description>" +
                                     "<name>Witsml Explorer</name>" +
                                   "</capClient>" +
                                 "</capClients>";
            var clientCapabilities = new WitsmlClientCapabilities
            {
                Name = "Witsml Explorer",
                Description = "Just a test"
            };
            var result = clientCapabilities.ToXml();

            Assert.Equal(expected, result);
        }

        [Fact]
        public void ToXml_WithContactInformation_ReturnsExpected()
        {
            var expected = @"<capClients version=""1.4.1"" xmlns=""http://www.witsml.org/schemas/1series"">" +
                                  @"<capClient apiVers=""1.4.1"">" +
                                     "<schemaVersion>1.3.1.1,1.4.1.1</schemaVersion>" +
                                     "<contact>" +
                                       "<name>Reodor Felgen</name>" +
                                       "<email>reodor.felgen@flaaklypa.no</email>" +
                                     "</contact>" +
                                   "</capClient>" +
                                 "</capClients>";
            var clientCapabilities = new WitsmlClientCapabilities
            {
                Contact = new ContactInformation
                {
                    Name = "Reodor Felgen",
                    Email = "reodor.felgen@flaaklypa.no"
                }
            };
            var result = clientCapabilities.ToXml();

            Assert.Equal(expected, result);
        }
    }
}
