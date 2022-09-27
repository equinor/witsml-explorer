using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class DeleteCurveValuesWorkerTest
    {
        private readonly DeleteCurveValuesWorker _worker;

        public DeleteCurveValuesWorkerTest()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);

            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteCurveValuesJob> logger = loggerFactory.CreateLogger<DeleteCurveValuesJob>();
            _worker = new DeleteCurveValuesWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteCurveValues()
        {
            string wellUid = "<WellUid>";
            string wellboreUid = "<WellboreUid";
            string logUid = "<LogUid>";
            List<string> mnemonics = new() { "BLOCKPOS", "CHOKE_PRESS", "UKNOWN", "DEPTH_HOLE" };
            List<IndexRange> indexRanges = new()
            {
                new IndexRange
                {
                    StartIndex = new DateTime(2019, 11, 20).ToString(CultureInfo.InvariantCulture),
                    EndIndex = new DateTime(2019, 11, 28).ToString(CultureInfo.InvariantCulture)
                }
            };

            DeleteCurveValuesJob job = new()
            {
                LogReference = new ObjectReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    Uid = logUid
                },
                Mnemonics = mnemonics,
                IndexRanges = indexRanges
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.True(result.IsSuccess, result.Reason);
        }
    }
}
