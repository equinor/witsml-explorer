using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Repositories
{
    public class MongoDbRepositoryTests
    {
        private readonly IDocumentRepository<Server, Guid> _repo;
        private readonly ITestOutputHelper _output;

        public MongoDbRepositoryTests(ITestOutputHelper output)
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            _repo = new MongoRepository<Server, Guid>(configuration);
            _output = output;
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetAllServers()
        {
            IEnumerable<Server> servers = await _repo.GetDocumentsAsync();
            foreach (Server server in servers)
            {
                _output.WriteLine(server.ToString());
            }
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task AddServer()
        {
            Server newServer = new()
            {
                Name = "<insert servername>",
                Url = new Uri("<insert url>"),
                Description = ""
            };
            Server server = await _repo.CreateDocumentAsync(newServer);
            _output.WriteLine($"Inserted server {server}");
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task RemoveServer()
        {
            Guid serverId = new("");
            await _repo.DeleteDocumentAsync(serverId);
            _output.WriteLine($"Removed server");
        }
    }
}

