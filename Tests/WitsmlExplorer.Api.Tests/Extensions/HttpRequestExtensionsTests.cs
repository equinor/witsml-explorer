using System;
using System.Text;

using Microsoft.AspNetCore.Http;

using Moq;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Extensions
{
    public class HttpRequestExtensionsTests
    {
        private readonly ServerCredentials _scInput;
        public HttpRequestExtensionsTests()
        {
            _scInput = new()
            {
                Host = new Uri("http://validstring.com"),
                UserId = "username",
                Password = "password"

            };
        }

        [Fact]
        public void GetWitsmlServerHttpHeader_ValidInputWithCreds_ServerCredentialsCorrectlyParsed()
        {
            string headerName = "WitsmlServer";

            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(_scInput.UserId + ":" + _scInput.Password));
            string headerValue = b64Creds + "@" + _scInput.Host;

            Mock<IHeaderDictionary> hDict = new();
            hDict.SetupGet(p => p[It.IsAny<string>()]).Returns(headerValue);
            Mock<HttpRequest> mockRequest = new();
            mockRequest.Setup(x => x.Headers).Returns(hDict.Object);

            // "Decrypt" function is not under test, return password back
            ServerCredentials testResult = mockRequest.Object.GetWitsmlServerHttpHeader(headerName, n => _scInput.Password);
            Assert.Equal(_scInput, testResult);
        }

        [Fact]
        public void GetWitsmlServerHttpHeader_ValidInputNoCreds_HostCorrectlyParsed()
        {
            string headerName = "WitsmlServer";
            string headerValue = _scInput.Host.ToString();

            Mock<IHeaderDictionary> hDict = new();
            hDict.SetupGet(p => p[It.IsAny<string>()]).Returns(headerValue);
            Mock<HttpRequest> mockRequest = new();
            mockRequest.Setup(x => x.Headers).Returns(hDict.Object);

            // "Decrypt" function is not under test
            ServerCredentials testResult = mockRequest.Object.GetWitsmlServerHttpHeader(headerName, n => "");
            Assert.Equal(_scInput.Host, testResult.Host);
        }

        [Fact]
        public void GetWitsmlServerHttpHeader_EmptyInput_NoExceptionReturnNull()
        {
            string headerName = "WitsmlServer";
            string headerValue = "";

            Mock<IHeaderDictionary> hDict = new();
            hDict.SetupGet(p => p[It.IsAny<string>()]).Returns(headerValue);
            Mock<HttpRequest> mockRequest = new();
            mockRequest.Setup(x => x.Headers).Returns(hDict.Object);

            // "Decrypt" function is not under test
            ServerCredentials testResult = mockRequest.Object.GetWitsmlServerHttpHeader(headerName, n => "");
            Assert.True(testResult.IsCredsNullOrEmpty() && testResult.Host == null);
        }

    }
}
