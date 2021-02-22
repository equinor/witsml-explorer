using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class DeleteCurveValuesWorkerTest
    {
        private readonly DeleteCurveValuesWorker worker;

        public DeleteCurveValuesWorkerTest()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new DeleteCurveValuesWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteCurveValues()
        {
            var wellUid = "<WellUid>";
            var wellboreUid = "<WellboreUid";
            var logUid = "<LogUid>";
            var mnemonics = new List<string> {"BLOCKPOS", "CHOKE_PRESS", "UKNOWN", "DEPTH_HOLE"};
            var indexRanges = new List<IndexRange>
            {
                new IndexRange
                {
                    StartIndex = new DateTime(2019, 11, 20).ToString(CultureInfo.InvariantCulture),
                    EndIndex = new DateTime(2019, 11, 28).ToString(CultureInfo.InvariantCulture)
                }
            };

            var job = new DeleteCurveValuesJob
            {
                LogReference = new LogReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    LogUid = logUid
                },
                Mnemonics = mnemonics,
                IndexRanges = indexRanges
            };

            var (result, _) = await worker.Execute(job);
            Assert.True(result.IsSuccess, result.Reason);
        }
    }
}
