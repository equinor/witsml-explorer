using Witsml.ServiceReference;

using Xunit;

namespace Witsml.Tests.ServiceReference
{
    public class OptionsInTests
    {
        [Fact]
        public void GetKeywords_WithReturnElementsAll_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(ReturnElements.All);

            Assert.Equal("returnElements=all", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeyWords_WithReturnElementsDataOnly_And_MaxReturnNodes50_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(ReturnElements.DataOnly, 50);

            Assert.Equal("returnElements=data-only;maxReturnNodes=50", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeyWords_MaxReturnNodes50ReturnLatestValues100_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(ReturnElements.DataOnly, 50, 100);
            Assert.Equal("returnElements=data-only;maxReturnNodes=50;requestLatestValues=100", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeyWords_ReturnLatestValues10_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(ReturnElements.DataOnly, null, 10);
            Assert.Equal("returnElements=data-only;requestLatestValues=10", optionsIn.GetKeywords());
        }
    }
}
