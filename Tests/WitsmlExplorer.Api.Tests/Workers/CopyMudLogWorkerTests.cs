using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyMudLogWorkerTests
    {
        private readonly CopyMudLogWorker _copyMudLogWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string MudLogUid = "mudLogUid";

        public CopyMudLogWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyMudLogJob>> logger = new();
            CopyUtils copyUtils = new(new Mock<ILogger<CopyUtils>>().Object);
            _copyMudLogWorker = new CopyMudLogWorker(logger.Object, witsmlClientProvider.Object, copyUtils);
        }

        [Fact]
        public async Task CopyMudLogOK()
        {
            CopyMudLogJob copyMudLogJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlMudLogs>(witsmlMudLogs => witsmlMudLogs.MudLogs.First().Uid == MudLogUid), new OptionsIn(ReturnElements.All, null, null)))
                .ReturnsAsync(GetSourceMudLogs());
            SetupGetWellbore();
            List<WitsmlMudLogs> copyMudLogQuery = SetupAddInStoreAsync();

            (WorkerResult, RefreshAction) result = await _copyMudLogWorker.Execute(copyMudLogJob);
            Assert.True(result.Item1.IsSuccess);
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null, null)))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = "Well1",
                            Uid = "wellbore1",
                            Name = "Wellbore 1",
                            NameWell = "Well 1"
                        }
                    }
                });
        }

        private List<WitsmlMudLogs> SetupAddInStoreAsync()
        {
            List<WitsmlMudLogs> addedMudLog = new();
            _witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlMudLogs>()))
                .Callback<WitsmlMudLogs>(addedMudLog.Add)
                .ReturnsAsync(new QueryResult(true));
            return addedMudLog;
        }

        private static CopyMudLogJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyMudLogJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { MudLogUid }
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static WitsmlMudLogs GetSourceMudLogs()
        {
            WitsmlMudLog witsmlMudLog = new()
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = MudLogUid,
                NameWell = "",
                NameWellbore = "",
                Name = "",
                CommonData = new WitsmlCommonData(),
                CustomData = new WitsmlCustomData()
            };
            return new WitsmlMudLogs
            {
                MudLogs = new List<WitsmlMudLog> { witsmlMudLog }
            };
        }
    }
}
