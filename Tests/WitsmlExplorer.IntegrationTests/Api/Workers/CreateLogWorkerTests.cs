using System;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CreateLogWorkerTests
    {
        private readonly CreateObjectOnWellboreWorker _worker;
        private static readonly string WELL_UID = "fa53698b-0a19-4f02-bca5-001f5c31c0ca";
        private static readonly string WELLBORE_UID = "eea43bf8-e3b7-42b6-b328-21b34cb505eb";

        public CreateLogWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<CreateObjectOnWellboreJob>();
            _worker = new CreateObjectOnWellboreWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateLog_DepthIndexed()
        {
            var job = new CreateObjectOnWellboreJob
            {
                Object = new LogObject
                {
                    Uid = Guid.NewGuid().ToString(),
                    Name = "Test depth",
                    WellUid = WELL_UID,
                    WellboreUid = WELLBORE_UID,
                    IndexCurve = "Depth"
                },
                ObjectType = EntityType.Log
            };

            await _worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateLog_TimeIndexed()
        {
            var job = new CreateObjectOnWellboreJob
            {
                Object = new LogObject
                {
                    Uid = Guid.NewGuid().ToString(),
                    Name = "Test time",
                    WellUid = WELL_UID,
                    WellboreUid = WELLBORE_UID,
                    IndexCurve = "Time"
                },
                ObjectType = EntityType.Log
            };

            await _worker.Execute(job);
        }
    }
}
