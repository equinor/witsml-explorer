using System;
using System.Text;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Moq;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Services
{
    public class CredentialsTest
    {
        private readonly CredentialsService _credentialsService;
        public CredentialsTest()
        {
            Mock<IOptions<WitsmlClientCapabilities>> clientCapabilitiesMock = new();
            clientCapabilitiesMock.Setup(ap => ap.Value).Returns(new WitsmlClientCapabilities());
            _credentialsService = new CredentialsService(
                DataProtectionProvider.Create("Mock"),
                new Mock<IHttpContextAccessor>().Object,
                clientCapabilitiesMock.Object,
                new Mock<IWitsmlSystemCredentials>().Object,
                new Mock<IDocumentRepository<Server, Guid>>().Object,
                new Mock<ILogger<CredentialsService>>().Object);
        }

        [Fact]
        public void GetBasicCredsFromHeader_ValidInput_CorrectlyParsed()
        {
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
            string input = b64Creds + "@" + scInput.Host;
            ServerCredentials serverCreds = _credentialsService.GetBasicCredsFromHeader(input);
            Assert.Equivalent(scInput, serverCreds);
        }

        [Fact]
        public void GetBasicCredsFromHeader_NoPassword_IsNullOrEmpty()
        {
            ServerCredentials scInput = new()
            {
                Host = new Uri("http://validstring.com"),
                Creds = new BasicCredentials()
                {
                    UserId = "username",
                    Password = null
                }
            };

            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(scInput.UserId + ":" + scInput.Password));
            string input = b64Creds + "@" + scInput.Host;
            ServerCredentials serverCreds = _credentialsService.GetBasicCredsFromHeader(input);
            Assert.True(serverCreds.IsNullOrEmpty());
        }
    }
}
