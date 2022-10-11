using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;

using Moq;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Services
{
    public class CredentialsServiceTests
    {
        private readonly CredentialsService _credentialsService;
        private readonly byte[] _secret = new byte[64];
        private readonly JwtSecurityToken _token;
        private readonly Mock<HttpRequest> _httpRequestMock;

        public CredentialsServiceTests()
        {
            Mock<IDataProtectionProvider> dataProtectorProvider = new();
            Mock<ITimeLimitedDataProtector> dataProtector = new();
            Mock<IHttpContextAccessor> httpContextAccessor = new();
            Mock<HttpContext> httpContext = new();
            _httpRequestMock = new Mock<HttpRequest>();
            Mock<ILogger<CredentialsService>> logger = new();
            Mock<IOptions<WitsmlClientCapabilities>> clientCapabilities = new();
            Mock<IWitsmlSystemCredentials> witsmlServerCredentials = new();
            Mock<IDocumentRepository<Server, Guid>> witsmlServerRepository = new();

            dataProtector.Setup(p => p.Protect(It.IsAny<byte[]>())).Returns((byte[] a) => a);
            dataProtector.Setup(p => p.Unprotect(It.IsAny<byte[]>())).Returns((byte[] a) => a);
            dataProtectorProvider.Setup(pp => pp.CreateProtector("WitsmlServerPassword")).Returns(dataProtector.Object);
            clientCapabilities.Setup(cc => cc.Value).Returns(new WitsmlClientCapabilities());
            httpContextAccessor.Setup(h => h.HttpContext).Returns(httpContext.Object);
            httpContext.Setup(h => h.Request).Returns(_httpRequestMock.Object);

            // Keyvault secrets
            witsmlServerCredentials.Setup(w => w.WitsmlCreds).Returns(new ServerCredentials[] {
                new ServerCredentials() {
                    Host = new Uri("http://some.url.com"),
                    UserId = "systemuser",
                    Password = "systempassword"
                }
            });
            // Configuration DB
            witsmlServerRepository.Setup(wsr => wsr.GetDocumentsAsync()).ReturnsAsync(new List<Server>() {
                new Server()
                {
                    Name = "Test Server",
                    Url = new Uri("http://some.url.com"),
                    Description = "Testserver for SystemCreds testing",
                    SecurityScheme = "OAuth2",
                    Roles = new List<string>() {"user","developer"}
                }
            });

            _credentialsService = new(
                dataProtectorProvider.Object,
                httpContextAccessor.Object,
                clientCapabilities.Object,
                witsmlServerCredentials.Object,
                witsmlServerRepository.Object,
                logger.Object
            );

            //create baseline token
            RandomNumberGenerator.Create().GetBytes(_secret);
            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Expires = DateTime.UtcNow.AddSeconds(60),
                Claims = new Dictionary<string, object>() {
                    { "roles", new List<string>() {"tester", "user" } }
                },
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(_secret),
                    SecurityAlgorithms.HmacSha256Signature,
                    SecurityAlgorithms.Sha512Digest
                )
            };
            _token = new JwtSecurityTokenHandler().CreateJwtSecurityToken(tokenDescriptor);
        }

        [Fact]
        public void GetCreds_BasicCreds_ReturnBasicCreds()
        {
            string token = null;
            ServerCredentials sc = new() { UserId = "username", Password = "password", Host = new Uri("http://some.url.com") };
            string headerName = WitsmlClientProvider.WitsmlTargetServerHeader;
            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(sc.UserId + ":" + sc.Password));
            string headerValue = b64Creds + "@" + sc.Host.ToString();

            //Mock request header content
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { headerName, headerValue } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(headerName, token).Result;
            Assert.True(creds.ToString() == sc.ToString());
        }

        [Fact]
        public void GetCreds_BasicNoCreds_ReturnEmpty()
        {
            string token = null;
            string headerName = WitsmlClientProvider.WitsmlTargetServerHeader;

            //Mock request header content
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { headerName, "http://some.url.com" } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(headerName, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }

        [Fact]
        public void GetCreds_BasicNoHeader_ReturnEmpty()
        {
            string token = null;
            string headerName = WitsmlClientProvider.WitsmlTargetServerHeader;

            //Mock request header content
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(headerName, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }
        [Fact]
        public void GetCreds_BasicAndTokenValidRolesHeaderValidURL_ReturnBasicCreds()
        {
            // WHEN
            //  Valid Basic credentials and Valid Bearer token are present along with Valid URL
            // THEN 
            //  Basic auth should always be preferred

            string headerName = WitsmlClientProvider.WitsmlTargetServerHeader;
            string token = new JwtSecurityTokenHandler().WriteToken(_token);
            ServerCredentials sc = new() { UserId = "username", Password = "password", Host = new Uri("http://some.url.com") };
            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(sc.UserId + ":" + sc.Password));
            string headerValue = b64Creds + "@" + sc.Host.ToString();

            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { headerName, headerValue } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(headerName, token).Result;
            Assert.True(creds.UserId == "username" && creds.Password == "password");
        }

        [Fact]
        public void GetCreds_TokenValidRolesHeaderValidURL_ReturnSystemCreds()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.com" and role: ["user"]
            // 2. CONFIG:   There exist system credentials in keyvault for server with URL: "http://some.url.com"
            // 3. REQUEST:  User provide token and roles in token: ["tester","user"]
            // 4. REQUEST:  HttpRequest provide WitsmlTargetServer Header with URL: "http://some.url.com"
            // 5. RESPONSE: System creds should be returned because server-roles and user-roles overlap

            string token = new JwtSecurityTokenHandler().WriteToken(_token);
            string header = WitsmlClientProvider.WitsmlTargetServerHeader;
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { header, "http://some.url.com" } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(header, token).Result;
            Assert.True(creds.UserId == "systemuser" && creds.Password == "systempassword");
        }

        [Fact]
        public void GetCreds_TokenValidRolesHeaderInValidURL_ReturnEmpty()
        {
            string token = new JwtSecurityTokenHandler().WriteToken(_token);
            string header = WitsmlClientProvider.WitsmlTargetServerHeader;
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { header, "http://some.invalidurl.com" } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(header, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }


        [Fact]
        public void GetCreds_TokenInValidRolesHeaderValidURL_ReturnEmpty()
        {
            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Expires = DateTime.UtcNow.AddSeconds(60),
                Claims = new Dictionary<string, object>() {
                    { "roles", new List<string>() {"public", "nonuser" } }
                }
            };
            string token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityTokenHandler().CreateJwtSecurityToken(tokenDescriptor));
            string header = WitsmlClientProvider.WitsmlTargetServerHeader;
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { { header, "http://some.url.com" } });
            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCreds(header, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }
    }
}
