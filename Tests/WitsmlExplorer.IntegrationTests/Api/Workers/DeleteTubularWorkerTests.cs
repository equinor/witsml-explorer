using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class DeleteTubularWorkerTests
    {
        private readonly DeleteTubularWorker _worker;

        public DeleteTubularWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            _worker = new DeleteTubularWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteTubular()
        {
            var job = new DeleteTubularsJob
            {
                Source = new TubularReferences
                {
                    WellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394",
                    WellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110",
                    TubularUids = new string[] { "2YA2M49" }
                }
            };
            await _worker.Execute(job);
        }
    }
}
