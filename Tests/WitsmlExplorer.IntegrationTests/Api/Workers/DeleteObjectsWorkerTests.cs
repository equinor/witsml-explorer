using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class DeleteObjectsWorkerTests
    {

        private readonly DeleteObjectsWorker _worker;

        public DeleteObjectsWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteObjectsJob> logger = loggerFactory.CreateLogger<DeleteObjectsJob>();
            _worker = new DeleteObjectsWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteObjects()
        {
            DeleteObjectsJob job = new()
            {
                ToDelete = new ObjectReferences()
                {
                    WellUid = "<well_uid>",
                    WellboreUid = "<wellbore_uid>",
                    ObjectUids = new string[] { "<object_uid_1>", "<object_uid_2>" },
                    ObjectType = EntityType.Log // set to the type of object you want to delete
                }
            };
            await _worker.Execute(job);
        }
    }
}
