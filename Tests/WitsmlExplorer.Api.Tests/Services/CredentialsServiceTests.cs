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
                    Roles = new List<string>() {"validrole","developer"}
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
        }

        [Fact]
        public void GetCreds_BasicCreds_ReturnBasicCreds()
        {
            string token = null;
            string basicHeader = CreateBasicHeaderValue("basicuser", "basicpassword", "http://some.url.com");
            IHeaderDictionary headers = CreateHeaders(basicHeader, token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.UserId == "basicuser" && creds.Password == "basicpassword");
        }

        [Fact]
        public void GetCreds_BasicNoCreds_ReturnEmpty()
        {
            string token = null;
            IHeaderDictionary headers = CreateHeaders("http://some.url.com", token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }

        [Fact]
        public void GetCreds_BasicNoHeader_ReturnEmpty()
        {
            string token = null;
            IHeaderDictionary headers = new HeaderDictionary(new Dictionary<string, StringValues> { });

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }
        [Fact]
        public void GetCreds_BasicAndTokenValidRolesHeaderValidURL_ReturnBasicCreds()
        {
            // WHEN
            //  Valid Basic credentials and Valid Bearer token are present along with Valid URL
            // THEN 
            //  Basic auth should always be preferred

            string basicHeader = CreateBasicHeaderValue("basicuser", "basicpassword", "http://some.url.com");
            string token = CreateJwtToken(new string[] { "validrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders(basicHeader, token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.UserId == "basicuser" && creds.Password == "basicpassword");
        }

        [Fact]
        public void GetCreds_ValidTokenValidRolesValidURLBasicHeader_ReturnSystemCreds()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.com" and role: ["user"]
            // 2. CONFIG:   There exist system credentials in keyvault for server with URL: "http://some.url.com"
            // 3. REQUEST:  User provide token and roles in token: ["tester","user"]
            // 4. REQUEST:  HttpRequest provide WitsmlTargetServer Header with URL: "http://some.url.com"
            // 5. RESPONSE: System creds should be returned because server-roles and user-roles overlap

            string token = CreateJwtToken(new string[] { "validrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders("http://some.url.com", token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.UserId == "systemuser" && creds.Password == "systempassword");
        }

        [Fact]
        public void GetCreds_ValidTokenValidRolesInvalidURLBasicHeader_ReturnEmpty()
        {
            string token = CreateJwtToken(new string[] { "validrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders("http://some.invalidurl.com", token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }

        [Fact]
        public void GetCreds_InvalidTokenRolesURLOnlyBasicHeader_ReturnEmpty()
        {
            string token = CreateJwtToken(new string[] { "invalidrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders("http://some.url.com", token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            ServerCredentials creds = _credentialsService.GetCredentials(WitsmlClientProvider.WitsmlTargetServerHeader, token).Result;
            Assert.True(creds.IsCredsNullOrEmpty());
        }

        [Fact]
        public void GetUsernames_ValidTokenValidRole_ReturnUPNFromToken()
        {
            string upn = "tokenuser@arpa.net";
            string token = CreateJwtToken(new string[] { "validrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders("http://some.url.com", token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            (string tokenUser, _) = _credentialsService.GetUsernames().Result;
            Assert.Equal(upn, tokenUser);
        }

        [Fact]
        public void GetUsernames_ValidTokenUserValidBasicUserValidRole_ReturnUsernames()
        {
            string upn = "tokenuser@arpa.net";
            string basicHeader = CreateBasicHeaderValue("basicuser", "basicpassword", "http://some.url.com");
            string token = CreateJwtToken(new string[] { "validrole" }, false, "tokenuser@arpa.net");
            IHeaderDictionary headers = CreateHeaders(basicHeader, token);

            _httpRequestMock.Setup(h => h.Headers).Returns(headers);

            (string tokenUser, string basicUser) = _credentialsService.GetUsernames().Result;
            Assert.Equal((upn, "basicuser"), (tokenUser, basicUser));
        }

        private static IHeaderDictionary CreateHeaders(string basicHeader, string bearerToken)
        {
            return new HeaderDictionary(new Dictionary<string, StringValues> {
                { WitsmlClientProvider.WitsmlTargetServerHeader, basicHeader },
                { "Authorization", $"Bearer {bearerToken}" }
            });
        }


        private static string CreateBasicHeaderValue(string username, string dummypassword, string host)
        {
            ServerCredentials sc = new() { UserId = username, Password = dummypassword, Host = new Uri(host) };
            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(sc.UserId + ":" + sc.Password));
            return b64Creds + "@" + sc.Host.ToString();
        }
        private static string CreateJwtToken(string[] appRoles, bool signed, string upn)
        {
            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Expires = DateTime.UtcNow.AddSeconds(60),
                Claims = new Dictionary<string, object>() {
                    { "roles", new List<string>(appRoles) },
                    { "upn", upn }
                }
            };
            if (signed)
            {
                byte[] secret = new byte[64];
                RandomNumberGenerator.Create().GetBytes(secret);
                tokenDescriptor.SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(secret),
                    SecurityAlgorithms.HmacSha256Signature,
                    SecurityAlgorithms.Sha512Digest
                );
            }
            return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityTokenHandler().CreateJwtSecurityToken(tokenDescriptor));
        }
    }
}
