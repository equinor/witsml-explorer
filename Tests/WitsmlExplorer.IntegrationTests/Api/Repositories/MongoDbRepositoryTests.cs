using System;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Repositories
{
    public class MongoDbRepositoryTests
    {
        private readonly IDocumentRepository<Server, Guid> repo;
        private readonly ITestOutputHelper output;

        public MongoDbRepositoryTests(ITestOutputHelper output)
        {
            var configuration = ConfigurationReader.GetConfig();
            repo = new MongoRepository<Server, Guid>(configuration);
            this.output = output;
        }

        [Fact(Skip="Should only be run manually")]
        public async Task GetAllServers()
        {
            var servers = await repo.GetDocumentsAsync();
            foreach (var server in servers)
            {
                output.WriteLine(server.ToString());
            }
        }

        [Fact(Skip="Should only be run manually")]
        public async Task AddServer()
        {
            var newServer = new Server
            {
                Name = "<insert servername>",
                Url = new Uri("<insert url>"),
                Description = ""
            };
            var server = await repo.CreateDocumentAsync(newServer);
            output.WriteLine($"Inserted server {server}");
        }

        [Fact(Skip="Should only be run manually")]
        public async Task RemoveServer()
        {
            var serverId = new Guid("");
            await repo.DeleteDocumentAsync(serverId);
            output.WriteLine($"Removed server");
        }
    }
}

