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
            Assert.True(testResult.IsNullOrEmpty() && testResult.Host == null);
        }

        [Fact]
        public void ParseServerHttpHeader_BasicCreds_ReturnBasicCreds()
        {
            string basicHeader = CreateBasicHeaderValue("basicuser", "basicpassword", "http://some.url.com");

            ServerCredentials creds = HttpRequestExtensions.ParseServerHttpHeader(basicHeader, n => n);
            Assert.True(creds.UserId == "basicuser" && creds.Password == "basicpassword");
        }

        [Fact]
        public void ParseServerHttpHeader_BasicNoCreds_ReturnEmpty()
        {
            string basicHeader = "http://some.url.com";

            ServerCredentials creds = HttpRequestExtensions.ParseServerHttpHeader(basicHeader, n => n);
            Assert.True(creds.IsNullOrEmpty());
        }

        [Fact]
        public void ParseServerHttpHeader_BasicNoHeader_ReturnEmpty()
        {
            string basicHeader = null;

            ServerCredentials creds = HttpRequestExtensions.ParseServerHttpHeader(basicHeader, n => n);
            Assert.True(creds.IsNullOrEmpty());
        }

        private static string CreateBasicHeaderValue(string username, string dummypassword, string host)
        {
            ServerCredentials sc = new() { UserId = username, Password = dummypassword, Host = new Uri(host) };
            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(sc.UserId + ":" + sc.Password));
            return b64Creds + "@" + sc.Host.ToString();
        }

    }
}
