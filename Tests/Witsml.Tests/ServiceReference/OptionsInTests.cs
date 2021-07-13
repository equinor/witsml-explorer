using Witsml.ServiceReference;
using Xunit;

namespace Witsml.Tests.ServiceReference
{
    public class OptionsInTests
    {
        [Fact]
        public void ToString_WithReturnElementsAll_ReturnsCorrectValue()
        {
            var optionsIn = new OptionsIn(ReturnElements.All);

            Assert.Equal("returnElements=all", optionsIn.ToString());
        }
    }
}
