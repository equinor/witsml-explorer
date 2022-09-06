using Witsml.ServiceReference;

using Xunit;

namespace Witsml.Tests.ServiceReference
{
    public class OptionsInTests
    {
        [Fact]
        public void GetKeywords_WithReturnElementsAll_ReturnsCorrectValue()
        {
            var optionsIn = new OptionsIn(ReturnElements.All);

            Assert.Equal("returnElements=all", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeyWords_WithReturnElementsDataOnly_And_MaxReturnNodes50_ReturnsCorrectValue()
        {
            var optionsIn = new OptionsIn(ReturnElements.DataOnly, 50);

            Assert.Equal("returnElements=data-only;maxReturnNodes=50", optionsIn.GetKeywords());
        }
    }
}
