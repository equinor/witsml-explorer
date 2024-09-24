using System;

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

        [Fact]
        public void GetKeywords_OptionsInString_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(OptionsInString: "foo=bar");
            Assert.Equal("foo=bar", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeywords_OptionsInString_WithSymbols_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(OptionsInString: "requestElements=data-only");
            Assert.Equal("requestElements=data-only", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeywords_OptionsInString_MultipleKeywords_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(OptionsInString: "foo=bar;baz=qux;quux=corge;grault=garply");
            Assert.Equal("foo=bar;baz=qux;quux=corge;grault=garply", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeywords_OptionsInStringAndOtherOptions_ReturnsCorrectValue()
        {
            OptionsIn optionsIn = new(ReturnElements.DataOnly, 50, 100, true, false, "foo=bar;baz=qux");
            Assert.Equal("returnElements=data-only;maxReturnNodes=50;requestLatestValues=100;requestObjectSelectionCapability=true;foo=bar;baz=qux", optionsIn.GetKeywords());
        }

        [Fact]
        public void OptionsInString_InvalidValue_ThrowsArgumentException()
        {
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "invalid"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "invalid="));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "invalid=true;"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: ";invalid=true"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "invalid-key=true"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "=true"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "foo=bar,baz=qux"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "foo=bar;;baz=qux"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "foo=baz=qux"));
            Assert.Throws<ArgumentException>(() => new OptionsIn(OptionsInString: "foo=bar;invalid;baz=qux"));
        }

        [Fact]
        public void GetKeywords_OptionsInString_EmptyValue_ReturnsEmpty()
        {
            OptionsIn optionsIn = new(OptionsInString: "");
            Assert.Equal("", optionsIn.GetKeywords());
        }

        [Fact]
        public void GetKeywords_OptionsInString_NullValue_ReturnsEmpty()
        {
            OptionsIn optionsIn = new(OptionsInString: null);
            Assert.Equal("", optionsIn.GetKeywords());
        }
    }
}
