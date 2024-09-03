using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyWbGeometrySectionWorkerTest
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyWbGeometrySectionWorker _worker;
        private readonly static string uid = "gs_uid";
        private readonly static string grade = "a";
        private readonly static string uom = "uom";
        private readonly static double value = 1.2;
        private readonly static decimal decimal_value = 1.2m;
        private readonly static string datum = "2023-04-19T00:00:04Z";
        private readonly static string fastFabric = "1.2";
        public ModifyWbGeometrySectionWorkerTest()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyWbGeometrySectionJob> logger = loggerFactory.CreateLogger<ModifyWbGeometrySectionJob>();
            _worker = new ModifyWbGeometrySectionWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task Update_GeometryStation()
        {
            ModifyWbGeometrySectionJob job = CreateJobTemplate();
            List<WitsmlWbGeometrys> updatedGeometrys = await MockJob(job);
            Assert.Single(updatedGeometrys);
            var wbGeometrySection = updatedGeometrys.First().WbGeometrys.First()
                .WbGeometrySections.First();
            Assert.Equal(grade, wbGeometrySection.Grade);
            Assert.Equal(uom, wbGeometrySection.DiaDrift.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.DiaDrift.Value);
            Assert.Equal(uom, wbGeometrySection.MdBottom.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.MdBottom.Value);
            Assert.Equal(datum, wbGeometrySection.MdBottom.Datum);
            Assert.Equal(uom, wbGeometrySection.MdTop.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.MdTop.Value);
            Assert.Equal(datum, wbGeometrySection.MdTop.Datum);
            Assert.Equal(uom, wbGeometrySection.TvdBottom.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.TvdBottom.Value);
            Assert.Equal(datum, wbGeometrySection.TvdBottom.Datum);
            Assert.Equal(uom, wbGeometrySection.TvdTop.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.TvdTop.Value);
            Assert.Equal(datum, wbGeometrySection.TvdTop.Datum);
            Assert.Equal(uom, wbGeometrySection.OdSection.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.OdSection.Value);
            Assert.Equal(uom, wbGeometrySection.WtPerLen.Uom);
            Assert.Equal(value.ToString(CultureInfo.InvariantCulture), wbGeometrySection.WtPerLen.Value);
            Assert.Equal(fastFabric, wbGeometrySection.FactFric);
            Assert.Equal(uid, wbGeometrySection.Uid);
        }

        private async Task<List<WitsmlWbGeometrys>> MockJob(ModifyWbGeometrySectionJob job)
        {
            List<WitsmlWbGeometrys> updatedWbGeometrys = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWbGeometrys>())).Callback<WitsmlWbGeometrys>(geometrys => updatedWbGeometrys.Add(geometrys))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);
            return updatedWbGeometrys;
        }

        private static ModifyWbGeometrySectionJob CreateJobTemplate()
        {
            return new ModifyWbGeometrySectionJob
            {
                WbGeometrySection = new WbGeometrySection()
                {
                    Uid = "gs_uid",
                    Grade = grade,
                    TypeHoleCasing = "typeholecasing",
                    MdTop = new MeasureWithDatum()
                    {
                        Datum = datum,
                        Uom = uom,
                        Value = value
                    },
                    MdBottom = new MeasureWithDatum()
                    {
                        Datum = datum,
                        Uom = uom,
                        Value = value
                    },
                    TvdBottom = new MeasureWithDatum()
                    {
                        Datum = datum,
                        Uom = uom,
                        Value = value
                    },
                    DiaDrift = new LengthMeasure()
                    {
                        Uom = uom,
                        Value = decimal_value
                    },
                    OdSection = new LengthMeasure()
                    {
                        Uom = uom,
                        Value = decimal_value
                    },
                    TvdTop = new MeasureWithDatum
                    {
                        Datum = datum,
                        Uom = uom,
                        Value = value
                    },
                    WtPerLen = new LengthMeasure()
                    {
                        Uom = uom,
                        Value = decimal_value
                    },
                    FactFric = value
                },

                WbGeometryReference = new ObjectReference()
                {
                    WellUid = "welluid",
                    WellboreUid = "wellboreuid",
                    Uid = "geometrysectionuid"
                }
            };
        }
    }
}
