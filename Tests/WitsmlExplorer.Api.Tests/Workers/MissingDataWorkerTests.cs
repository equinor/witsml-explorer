using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Rig;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class MissingDataWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly MissingDataWorker _worker;

        public MissingDataWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<MissingDataJob> logger = loggerFactory.CreateLogger<MissingDataJob>();
            _worker = new MissingDataWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public void IsPropertyEmpty_Null_ReturnsTrue()
        {
            object obj = null;
            Assert.True(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_EmptyString_ReturnsTrue()
        {
            string obj = string.Empty;
            Assert.True(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_String_ReturnsFalse()
        {
            string obj = "123";
            Assert.False(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_EmptyList_ReturnsTrue()
        {
            var obj = new List<object>();
            Assert.True(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_List_ReturnsFalse()
        {
            var obj = new List<object>() { "123" };
            Assert.False(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_EmptyObject_ReturnsTrue()
        {
            var obj = new WitsmlWell { };
            Assert.True(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_Object_ReturnsFalse()
        {
            var obj = new WitsmlWell { Uid = "uid" };
            Assert.False(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_EmptyNestedObject_ReturnsTrue()
        {
            var obj = new WitsmlWell { CommonData = new WitsmlCommonData() };
            Assert.True(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public void IsPropertyEmpty_NestedObject_ReturnsFalse()
        {
            var obj = new WitsmlWell { CommonData = new WitsmlCommonData { SourceName = "sourceName" } };
            Assert.False(MissingDataWorker.IsPropertyEmpty(obj));
        }

        [Fact]
        public async Task Execute_CheckWellProperties_AddsMissingProperties()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<WitsmlWells>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(GetTestWells()));
            var properties = new List<string>
            {
                "name",
                "field",
                "numLicense",
                "commonData.sourceName"
            };
            var checks = new List<MissingDataCheck> {
                new MissingDataCheck
                {
                    ObjectType = EntityType.Well,
                    Properties = properties
                }
            };
            var job = CreateJobTemplate(checks, true, false);
            var (workerResult, _) = await _worker.Execute(job);
            var report = job.JobInfo.Report;
            List<MissingDataReportItem> reportItems = (List<MissingDataReportItem>)report.ReportItems;

            Assert.True(workerResult.IsSuccess);
            Assert.DoesNotContain(reportItems, item => !properties.Contains(item.Property));
            Assert.DoesNotContain(reportItems, item => item.Property == "name");
            Assert.DoesNotContain(reportItems, item => item.WellUid == "well3Uid");
            Assert.Contains(reportItems, item => item.Property == "field" && item.WellUid == "well1Uid");
            Assert.Contains(reportItems, item => item.Property == "numLicense" && item.WellUid == "well1Uid");
            Assert.Contains(reportItems, item => item.Property == "numLicense" && item.WellUid == "well2Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.WellUid == "well1Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.WellUid == "well2Uid");
        }

        [Fact]
        public async Task Execute_CheckWellboreProperties_AddsMissingProperties()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(GetTestWellboresForWell1()));
            var properties = new List<string>
            {
                "name",
                "number",
                "isActive",
                "commonData.sourceName"
            };
            var checks = new List<MissingDataCheck> {
                new MissingDataCheck
                {
                    ObjectType = EntityType.Wellbore,
                    Properties = properties
                }
            };
            var job = CreateJobTemplate(checks, false, true);
            var (workerResult, _) = await _worker.Execute(job);
            var report = job.JobInfo.Report;
            List<MissingDataReportItem> reportItems = (List<MissingDataReportItem>)report.ReportItems;

            Assert.True(workerResult.IsSuccess);
            Assert.DoesNotContain(reportItems, item => !properties.Contains(item.Property));
            Assert.DoesNotContain(reportItems, item => item.Property == "name");
            Assert.True(reportItems.All(item => item.WellUid == "well1Uid"));
            Assert.Contains(reportItems, item => item.Property == "number" && item.WellboreUid == "well1Wellbore1Uid");
            Assert.Contains(reportItems, item => item.Property == "isActive" && item.WellboreUid == "well1Wellbore1Uid");
            Assert.Contains(reportItems, item => item.Property == "isActive" && item.WellboreUid == "well1Wellbore2Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.WellboreUid == "well1Wellbore1Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.WellboreUid == "well1Wellbore2Uid");
        }

        [Fact]
        public async Task Execute_CheckRigProperties_AddsMissingProperties()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(GetAllTestRigs()));
            var properties = new List<string>
            {
                "name",
                "typeRig",
                "classRig",
                "commonData.sourceName"
            };
            var checks = new List<MissingDataCheck> {
                new MissingDataCheck
                {
                    ObjectType = EntityType.Rig,
                    Properties = properties
                }
            };
            var job = CreateJobTemplate(checks, true, false);
            var (workerResult, _) = await _worker.Execute(job);
            var report = job.JobInfo.Report;
            List<MissingDataReportItem> reportItems = (List<MissingDataReportItem>)report.ReportItems;

            Assert.True(workerResult.IsSuccess);
            Assert.DoesNotContain(reportItems, item => !properties.Contains(item.Property));
            Assert.DoesNotContain(reportItems, item => item.Property == "name");
            Assert.Contains(reportItems, item => item.Property == "typeRig" && item.ObjectUid == "Well1Wellbore1Rig1Uid");
            Assert.Contains(reportItems, item => item.Property == "classRig" && item.ObjectUid == "Well1Wellbore1Rig1Uid");
            Assert.Contains(reportItems, item => item.Property == "classRig" && item.ObjectUid == "Well1Wellbore1Rig2Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.ObjectUid == "Well1Wellbore1Rig1Uid");
            Assert.Contains(reportItems, item => item.Property == "commonData.sourceName" && item.ObjectUid == "Well2Wellbore1Rig1Uid");
        }

        [Fact]
        public async Task Execute_CheckMissingWellbore_AddsWellboresWithNoRigs()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<WitsmlWellbores>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(GetAllTestWellbores()));
            var checks = new List<MissingDataCheck> {
                new MissingDataCheck
                {
                    ObjectType = EntityType.Wellbore,
                    Properties = new List<string> ()
                }
            };
            var job = CreateJobTemplate(checks, true, false);
            var (workerResult, _) = await _worker.Execute(job);
            var report = job.JobInfo.Report;
            List<MissingDataReportItem> reportItems = (List<MissingDataReportItem>)report.ReportItems;
            Assert.Single(reportItems);
            Assert.Contains(reportItems, item => item.WellUid == "well3Uid");
            Assert.True(workerResult.IsSuccess);
        }

        [Fact]
        public async Task Execute_CheckMissingRig_AddsWellboresWithNoRigs()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(GetTestRigsForWell1()));
            var checks = new List<MissingDataCheck> {
                new MissingDataCheck
                {
                    ObjectType = EntityType.Rig,
                    Properties = new List<string> ()
                }
            };
            var job = CreateJobTemplate(checks, false, true);
            var (workerResult, _) = await _worker.Execute(job);
            var report = job.JobInfo.Report;
            List<MissingDataReportItem> reportItems = (List<MissingDataReportItem>)report.ReportItems;
            Assert.Single(reportItems);
            Assert.Contains(reportItems, item => item.WellboreUid == "well1Wellbore2Uid");
            Assert.True(workerResult.IsSuccess);
        }

        private static WitsmlWells GetTestWells()
        {
            return new WitsmlWells
            {
                Wells = new List<WitsmlWell>()
                {
                    new WitsmlWell
                    {
                        Uid = "well1Uid",
                        Name = "Well1Name",
                    },
                    new WitsmlWell
                    {
                        Uid = "well2Uid",
                        Name = "Well2Name",
                        Field = "field",
                        CommonData = new WitsmlCommonData {ServiceCategory = "serviceCategory"}
                    },
                    new WitsmlWell
                    {
                        Uid = "well3Uid",
                        Name = "Well3Name",
                        Field = "field",
                        NumLicense = "license",
                        CommonData = new WitsmlCommonData {SourceName = "sourceName"}
                    }
                }
            };
        }

        private static WitsmlWellbores GetAllTestWellbores()
        {
            return new WitsmlWellbores
            {
                Wellbores = new List<WitsmlWellbore>()
                {
                    new WitsmlWellbore
                    {
                        Uid = "well1Wellbore1Uid",
                        Name = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                    },
                    new WitsmlWellbore
                    {
                        Uid = "well1Wellbore2Uid",
                        Name = "Well1Wellbore2Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                        Number = "number",
                        CommonData = new WitsmlCommonData {ServiceCategory = "serviceCategory"}
                    },
                    new WitsmlWellbore
                    {
                        Uid = "well2Wellbore1Uid",
                        Name = "Well2Wellbore1Name",
                        UidWell = "well2Uid",
                        NameWell = "well2Name",
                        Number = "number",
                        IsActive = "True",
                        CommonData = new WitsmlCommonData {SourceName = "sourceName"}
                    }
                }
            };
        }

        private static WitsmlWellbores GetTestWellboresForWell1()
        {
            return new WitsmlWellbores
            {
                Wellbores = new List<WitsmlWellbore>()
                {
                    new WitsmlWellbore
                    {
                        Uid = "well1Wellbore1Uid",
                        Name = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                    },
                    new WitsmlWellbore
                    {
                        Uid = "well1Wellbore2Uid",
                        Name = "Well1Wellbore2Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                        Number = "number",
                        CommonData = new WitsmlCommonData {ServiceCategory = "serviceCategory"}
                    },
                }
            };
        }

        private static IWitsmlObjectList GetAllTestRigs()
        {
            return new WitsmlRigs
            {
                Rigs = new List<WitsmlRig>()
                {
                    new WitsmlRig
                    {
                        Uid = "Well1Wellbore1Rig1Uid",
                        Name = "Well1Wellbore1Rig1Name",
                        UidWellbore = "well1Wellbore1Uid",
                        NameWellbore = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                    },
                    new WitsmlRig
                    {
                        Uid = "Well1Wellbore1Rig2Uid",
                        Name = "Well1Wellbore1Rig2Name",
                        UidWellbore = "well1Wellbore1Uid",
                        NameWellbore = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                        TypeRig = "typeRig",
                        CommonData = new WitsmlCommonData {SourceName = "sourceName"}
                    },
                    new WitsmlRig
                    {
                        Uid = "Well2Wellbore1Rig1Uid",
                        Name = "Well2Wellbore1Rig1Name",
                        UidWellbore = "well2Wellbore1Uid",
                        NameWellbore = "Well2Wellbore1Name",
                        UidWell = "well2Uid",
                        NameWell = "well2Name",
                        TypeRig = "typeRig",
                        ClassRig = "classRig",
                        CommonData = new WitsmlCommonData {ServiceCategory = "serviceCategory"}
                    }
                }
            };
        }

        private static IWitsmlObjectList GetTestRigsForWell1()
        {
            return new WitsmlRigs
            {
                Rigs = new List<WitsmlRig>()
                {
                    new WitsmlRig
                    {
                        Uid = "Well1Wellbore1Rig1Uid",
                        Name = "Well1Wellbore1Rig1Name",
                        UidWellbore = "well1Wellbore1Uid",
                        NameWellbore = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                    },
                    new WitsmlRig
                    {
                        Uid = "Well1Wellbore1Rig2Uid",
                        Name = "Well1Wellbore1Rig2Name",
                        UidWellbore = "well1Wellbore1Uid",
                        NameWellbore = "Well1Wellbore1Name",
                        UidWell = "well1Uid",
                        NameWell = "well1Name",
                        TypeRig = "typeRig",
                        CommonData = new WitsmlCommonData {SourceName = "sourceName"}
                    },
                }
            };
        }

        private static MissingDataJob CreateJobTemplate(List<MissingDataCheck> checks, bool testWells, bool testWellbores)
        {
            var wells = new List<WellReference>
            {
                new WellReference
                {
                    WellName = "well1Name",
                    WellUid = "well1Uid"
                },
                new WellReference
                {
                    WellName = "well2Name",
                    WellUid = "well2Uid"
                },
                new WellReference
                {
                    WellName = "well3Name",
                    WellUid = "well3Uid"
                },
            };

            var wellbores = new List<WellboreReference>
            {
                new WellboreReference
                {
                    WellName = "well1Name",
                    WellUid = "well1Uid",
                    WellboreName = "well1Wellbore1Name",
                    WellboreUid = "well1Wellbore1Uid",
                },
                new WellboreReference
                {
                    WellName = "well1Name",
                    WellUid = "well1Uid",
                    WellboreName = "well1Wellbore2Name",
                    WellboreUid = "well1Wellbore2Uid",
                },
            };

            return new MissingDataJob
            {
                WellReferences = testWells ? wells : new List<WellReference>(),
                WellboreReferences = testWellbores ? wellbores : new List<WellboreReference>(),
                MissingDataChecks = checks,
                JobInfo = new JobInfo(),
            };
        }
    }
}
