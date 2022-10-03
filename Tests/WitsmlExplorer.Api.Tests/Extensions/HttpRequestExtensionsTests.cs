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
        public HttpRequestExtensionsTests()
        {

        }

        [Fact]
        public void GetWitsmlServerHttpHeader_ValidInput_CorrectlyParsed()
        {
            string headerName = "WitsmlServer";

            ServerCredentials scInput = new()
            {
                Host = new Uri("http://validstring.com"),
                Creds = new BasicCredentials()
                {
                    UserId = "username",
                    Password = "password"
                }
            };

            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(scInput.UserId + ":" + scInput.Password));
            string headerValue = b64Creds + "@" + scInput.Host;


            Mock<HttpRequest> mockRequest = new();
            Mock<IHeaderDictionary> hDict = new();
            mockRequest.Setup(x => x.Headers).Returns(hDict.Object);
            hDict.SetupGet(p => p[It.IsAny<string>()]).Returns(headerValue);

            ServerCredentials testResult = mockRequest.Object.GetWitsmlServerHttpHeader(headerName, n => scInput.Password);
            Assert.Equal(scInput, testResult);
        }


    }
}
