using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

using Measure = WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyWellboreWorkerTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly ModifyWellboreWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";

        public ModifyWellboreWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<ModifyWellboreJob>();
            _worker = new ModifyWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWellbore()
        {
            var expectedNewName = "NewName";
            var job = CreateJobTemplate();
            job.Wellbore.Name = expectedNewName;

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Assert.Single(updatedWellbores);
            Assert.Equal(expectedNewName, updatedWellbores.First().Wellbores.First().Name);
        }

        [Fact]
        public async Task RenameWellbore_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Name = "";

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Md()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.Md = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var md = updatedWellbores.First().Wellbores.First().Md;
            var actual = decimal.Parse(md.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Md_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Md = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for Md cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Tvd()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.Tvd = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var tvd = updatedWellbores.First().Wellbores.First().Tvd;
            var actual = decimal.Parse(tvd.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Tvd_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Tvd = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for Tvd cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdKickoff()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var mdKickoff = updatedWellbores.First().Wellbores.First().MdKickoff;
            var actual = decimal.Parse(mdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdKickoff_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdKickoff cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdKickoff()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var tvdKickoff = updatedWellbores.First().Wellbores.First().TvdKickoff;
            var actual = decimal.Parse(tvdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdKickoff_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdKickoff cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdPlanned()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var mdPlanned = updatedWellbores.First().Wellbores.First().MdPlanned;
            var actual = decimal.Parse(mdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdPlanned()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var tvdPlanned = updatedWellbores.First().Wellbores.First().TvdPlanned;
            var actual = decimal.Parse(tvdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var mdSubSeaPlanned = updatedWellbores.First().Wellbores.First().MdSubSeaPlanned;
            var actual = decimal.Parse(mdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdSubSeaPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var tvdSubSeaPlanned = updatedWellbores.First().Wellbores.First().TvdSubSeaPlanned;
            var actual = decimal.Parse(tvdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdSubSeaPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_DayTarget()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Measure.DayMeasure { Value = expectedValue, Uom = "d" };

            var updatedWellbores = new List<WitsmlWellbores>();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            var dayTarget = updatedWellbores.First().Wellbores.First().DayTarget;
            var actual = decimal.Parse(dayTarget.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_DayTarget_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Measure.DayMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for DayTarget cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        private static ModifyWellboreJob CreateJobTemplate()
        {
            return new ModifyWellboreJob
            {
                Wellbore = new Wellbore
                {
                    WellUid = WellUid,
                    Uid = WellboreUid
                }
            };
        }
    }
}
