using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using Moq;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

using Xunit;
namespace WitsmlExplorer.Api.Tests.Services
{
    [Collection("UsingCache")]
    public class CredentialsServiceTests
    {
        private readonly CredentialsService _basicCredentialsService;
        private readonly CredentialsService _oauthCredentialsService;

        public CredentialsServiceTests()
        {
            Mock<IDataProtectionProvider> dataProtectorProvider = new();
            Mock<ITimeLimitedDataProtector> dataProtector = new();
            Mock<ILogger<CredentialsService>> logger = new();
            Mock<IOptions<WitsmlClientCapabilities>> clientCapabilities = new();
            Mock<IWitsmlSystemCredentials> witsmlServerCredentials = new();
            Mock<IDocumentRepository<Server, Guid>> witsmlServerRepository = new();
            CredentialsCache credentialsCache = new(new Mock<ILogger<CredentialsCache>>().Object);
            Mock<IConfiguration> basicConfiguration = new();
            Mock<IConfiguration> oauthConfiguration = new();

            dataProtector.Setup(p => p.Protect(It.IsAny<byte[]>())).Returns((byte[] a) => a);
            dataProtector.Setup(p => p.Unprotect(It.IsAny<byte[]>())).Returns((byte[] a) => a);
            dataProtectorProvider.Setup(pp => pp.CreateProtector("WitsmlServerPassword")).Returns(dataProtector.Object);
            clientCapabilities.Setup(cc => cc.Value).Returns(new WitsmlClientCapabilities());

            // Keyvault secrets
            witsmlServerCredentials.Setup(w => w.WitsmlCreds).Returns(new ServerCredentials[] {
                new ServerCredentials() {
                    Host = new Uri("http://some.url.com"),
                    UserId = "systemuser",
                    Password = "systempassword",
                    CredentialId = "systemCredentialId1"
                },
                new ServerCredentials() {
                    Host = new Uri("http://some.url.com"),
                    UserId = "systemuser2",
                    Password = "systempassword2",
                    CredentialId = "systemCredentialId2"
                }
            });
            // Configuration DB
            witsmlServerRepository.Setup(wsr => wsr.GetDocumentsAsync()).ReturnsAsync(new List<Server>() {
                new Server()
                {
                    Name = "Test Server",
                    Url = new Uri("http://some.url.com"),
                    Description = "Testserver for SystemCreds testing",
                    Roles = new List<string>() {"validrole","developer"}
                },
                new Server()
                {
                    Name = "Test Server 2",
                    Url = new Uri("http://some.url.without.its.own.keyvault.secret.com"),
                    Description = "Testserver that does not have its url specified in a keyvault secret",
                    Roles = new List<string>() {"validrole","developer"},
                    CredentialIds = new List<string> { "systemCredentialId1", "systemCredentialId2" }
                },
                new Server()
                {
                    Name = "Test Server 3",
                    Url = new Uri("http://url3.com"),
                    Description = "Testserver with invalid credentialId and without its url specified in a keyvault secret",
                    Roles = new List<string>() {"validrole","developer"},
                    CredentialIds = new List<string> { "invalidSystemCredentialId" }
                }
            });

            basicConfiguration.SetupGet(p => p[ConfigConstants.OAuth2Enabled]).Returns("False");
            _basicCredentialsService = new(
                dataProtectorProvider.Object,
                clientCapabilities.Object,
                witsmlServerCredentials.Object,
                witsmlServerRepository.Object,
                credentialsCache,
                logger.Object,
                basicConfiguration.Object
            );

            oauthConfiguration.SetupGet(p => p[ConfigConstants.OAuth2Enabled]).Returns("True");
            _oauthCredentialsService = new(
                dataProtectorProvider.Object,
                clientCapabilities.Object,
                witsmlServerCredentials.Object,
                witsmlServerRepository.Object,
                credentialsCache,
                logger.Object,
                oauthConfiguration.Object
            );
        }

        [Fact]
        public void GetCredentials_ValidTokenValidRolesValidURLValidUsername_ReturnSystemCreds()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.com" and role: ["validrole"]
            // 2. CONFIG:   There exist system credentials in keyvault for server with URL: "http://some.url.com"
            // 3. REQUEST:  User provide token and valid roles in token
            // 4. REQUEST:  Header WitsmlTargetServer Header with URL: "http://some.url.com"
            // 5. RESPONSE: System creds should be returned because server-roles and user-roles overlap
            string server = "http://some.url.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            ServerCredentials creds = _oauthCredentialsService.GetCredentials(eh, server, "systemuser");
            Assert.True(creds.UserId == "systemuser" && creds.Password == "systempassword");
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public async Task GetLoggedInUsernames_ValidTokenValidRolesValidURLValidUsername_ReturnMultipleUsernames()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.com" and role: ["validrole"]
            // 2. CONFIG:   There exist system credentials in keyvault for server with URL: "http://some.url.com"
            // 3. REQUEST:  User provide token and valid roles in token
            // 4. REQUEST:  Header WitsmlTargetServer Header with URL: "http://some.url.com"
            // 5. RESPONSE: System usernames should be returned because server-roles and user-roles overlap
            string server = "http://some.url.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            string[] usernames = await _oauthCredentialsService.GetLoggedInUsernames(eh, new Uri(server));
            Assert.Contains("systemuser", usernames);
            Assert.Contains("systemuser2", usernames);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public async Task GetLoggedInUsernames_AllValidWithCredentialIds_ReturnUsernames()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.without.its.own.keyvault.secret.com" and role: ["validrole"]
            // 2. CONFIG:   There does NOT exist system credentials in keyvault for server with URL: "http://some.url.without.its.own.keyvault.secret.com"
            // 3. CONFIG:   There exist system credentials in keyvault with credential Id: "systemCredentialId1"
            // 4. REQUEST:  User provide token and valid roles in token
            // 5. REQUEST:  Header WitsmlTargetServer Header with URL: "http://some.url.without.its.own.keyvault.secret.com"
            // 6. RESPONSE: System usernames should be returned because server-roles and user-roles overlap
            string server = "http://some.url.without.its.own.keyvault.secret.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            string[] usernames = await _oauthCredentialsService.GetLoggedInUsernames(eh, new Uri(server));
            Assert.Contains("systemuser", usernames);
            Assert.Contains("systemuser2", usernames);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public async Task GetLoggedInUsernames_AllValidWithInvalidCredentialId_ReturnEmpty()
        {
            // 1. CONFIG:   There is a server config in DB with URL: "http://some.url.without.its.own.keyvault.secret.com" and role: ["validrole"]
            // 2. CONFIG:   There does NOT exist system credentials in keyvault for server with URL: "http://some.url.without.its.own.keyvault.secret.com"
            // 3. CONFIG:   There exist system credentials in keyvault with credential Id: "systemCredentialId1"
            // 4. REQUEST:  User provide token and valid roles in token
            // 5. REQUEST:  Header WitsmlTargetServer Header with URL: "http://some.url.without.its.own.keyvault.secret.com"
            // 6. RESPONSE: System usernames should be returned because server-roles and user-roles overlap
            string server = "http://url3.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            string[] usernames = await _oauthCredentialsService.GetLoggedInUsernames(eh, new Uri(server));
            Assert.Empty(usernames);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public void GetCredentials_ValidTokenValidRolesInvalidURL_ReturnNull()
        {
            string server = "http://some.invalidurl.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            ServerCredentials creds = _oauthCredentialsService.GetCredentials(eh, server, "systemuser");
            Assert.Null(creds);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public void GetCredentials_ValidTokenValidRolesValidURLInvalidCredentialId_ReturnNull()
        {
            string server = "http://url3.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "validrole" }, false, "tokenuser@arpa.net");

            ServerCredentials creds = _oauthCredentialsService.GetCredentials(eh, server, "systemuser");
            Assert.Null(creds);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public void GetCredentials_InvalidTokenRolesURLOnlyBasicHeader_ReturnNull()
        {
            string server = "http://some.url.com";
            EssentialHeaders eh = CreateEhWithAuthorization(new string[] { "invalidrole" }, false, "tokenuser@arpa.net");

            ServerCredentials creds = _oauthCredentialsService.GetCredentials(eh, server, "systemuser");
            Assert.Null(creds);
            _oauthCredentialsService.RemoveAllCachedCredentials();
        }

        [Fact]
        public void GetCredentials_CredentialsInCache_ReturnCorrectly()
        {
            string userId = "username";
            string cacheId = Guid.NewGuid().ToString();
            ServerCredentials sc = new() { UserId = userId, Password = "dummypassword", Host = new Uri("https://somehost.url") };
            string b64Creds = Convert.ToBase64String(Encoding.ASCII.GetBytes(sc.UserId + ":" + sc.Password));
            string headerValue = b64Creds + "@" + sc.Host;

            Mock<IEssentialHeaders> headersMock = new();
            headersMock.Setup(x => x.GetCookieValue()).Returns(cacheId);
            headersMock.SetupGet(x => x.TargetServer).Returns(sc.Host.ToString());

            _basicCredentialsService.CacheCredentials(cacheId, sc, 1.0, n => n);
            ServerCredentials fromCache = _basicCredentialsService.GetCredentials(headersMock.Object, headersMock.Object.TargetServer, userId);
            Assert.Equal(sc, fromCache);
            _basicCredentialsService.RemoveAllCachedCredentials();
        }

        private static EssentialHeaders CreateEhWithAuthorization(string[] appRoles, bool signed, string upn)
        {
            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Expires = DateTime.UtcNow.AddSeconds(60),
                Claims = new Dictionary<string, object>() {
                    { "roles", new List<string>(appRoles) },
                    { "upn", upn },
                    { "sub", Guid.NewGuid().ToString() }
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
            return new()
            {
                Authorization = "Bearer " + new JwtSecurityTokenHandler().WriteToken(new JwtSecurityTokenHandler().CreateJwtSecurityToken(tokenDescriptor))
            };
        }
    }
}
