using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeleteEmptyMnemonicsWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly DeleteEmptyMnemonicsWorker _worker;

        public DeleteEmptyMnemonicsWorkerTest()
        {
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteEmptyMnemonicsJob> logger = loggerFactory.CreateLogger<DeleteEmptyMnemonicsJob>();

            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(wcp => wcp.GetClient()).Returns(_witsmlClient.Object);

            Mock<IWellboreService> wellboreService = new();
            wellboreService.Setup(ws => ws.GetWellbores("123")).Returns(Task.Run(() => (IEnumerable<Wellbore>)new List<Wellbore>()));

            Mock<ILogObjectService> logObjectService = new();
            logObjectService.Setup(los => los.GetLogCurveInfo("", "", "")).Returns(Task.Run(() => (IEnumerable<LogCurveInfo>)new List<LogCurveInfo>()));
            logObjectService.Setup(los => los.GetLogs("", "")).Returns(Task.Run(() => (IEnumerable<LogObject>)new List<LogObject>()));

            Mock<IMnemonicService> mnemonicService = new();
            mnemonicService.Setup(ms => ms.DeleteMnemonic("", "", "", new LogCurveInfo())).Returns(Task.Run(() => new QueryResult(true)));

            _worker = new DeleteEmptyMnemonicsWorker(logger, witsmlClientProvider.Object, wellboreService.Object, logObjectService.Object, mnemonicService.Object);
        }

        [Fact]
        public async Task DeleteEmptyMnemonics()
        {
            var job = CreateJob();

            var result = await _worker.Execute(job);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWells>()), Times.Never);
        }

        private DeleteEmptyMnemonicsJob CreateJob()
        {
            return new DeleteEmptyMnemonicsJob()
            {
                NullDepthValue = 0,
                NullTimeValue = new DateTime(),
                Wellbores = new List<WellboreReference> { },
                Wells = new List<WellReference> { }
            };
        }
    }
}
