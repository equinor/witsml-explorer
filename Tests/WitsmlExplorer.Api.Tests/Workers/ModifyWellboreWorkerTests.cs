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
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyWellboreJob> logger = loggerFactory.CreateLogger<ModifyWellboreJob>();
            _worker = new ModifyWellboreWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWellbore()
        {
            string expectedNewName = "NewName";
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Name = expectedNewName;

            List<WitsmlWellbores> updatedWellbores = new();
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
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Name = string.Empty;

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Md()
        {
            const int expectedValue = 10;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Md = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlMeasuredDepthCoord md = updatedWellbores.First().Wellbores.First().Md;
            decimal actual = decimal.Parse(md.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Md_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Md = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for Md cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Tvd()
        {
            const int expectedValue = 20;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Tvd = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlWellVerticalDepthCoord tvd = updatedWellbores.First().Wellbores.First().Tvd;
            decimal actual = decimal.Parse(tvd.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Tvd_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.Tvd = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for Tvd cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdKickoff()
        {
            const int expectedValue = 10;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlMeasuredDepthCoord mdKickoff = updatedWellbores.First().Wellbores.First().MdKickoff;
            decimal actual = decimal.Parse(mdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdKickoff_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdKickoff cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdKickoff()
        {
            const int expectedValue = 20;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlWellVerticalDepthCoord tvdKickoff = updatedWellbores.First().Wellbores.First().TvdKickoff;
            decimal actual = decimal.Parse(tvdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdKickoff_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdKickoff cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdPlanned()
        {
            const int expectedValue = 10;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlMeasuredDepthCoord mdPlanned = updatedWellbores.First().Wellbores.First().MdPlanned;
            decimal actual = decimal.Parse(mdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdPlanned_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdPlanned()
        {
            const int expectedValue = 20;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlWellVerticalDepthCoord tvdPlanned = updatedWellbores.First().Wellbores.First().TvdPlanned;
            decimal actual = decimal.Parse(tvdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdPlanned_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned()
        {
            const int expectedValue = 10;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlMeasuredDepthCoord mdSubSeaPlanned = updatedWellbores.First().Wellbores.First().MdSubSeaPlanned;
            decimal actual = decimal.Parse(mdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for MdSubSeaPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned()
        {
            const int expectedValue = 20;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Measure.LengthMeasure { Value = expectedValue, Uom = CommonConstants.Unit.Feet };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlWellVerticalDepthCoord tvdSubSeaPlanned = updatedWellbores.First().Wellbores.First().TvdSubSeaPlanned;
            decimal actual = decimal.Parse(tvdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Measure.LengthMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
            Assert.Equal("unit of measure for TvdSubSeaPlanned cannot be empty", exception.Message);

            _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_DayTarget()
        {
            const int expectedValue = 10;
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Measure.DayMeasure { Value = expectedValue, Uom = "d" };

            List<WitsmlWellbores> updatedWellbores = new();
            _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await _worker.Execute(job);

            Witsml.Data.Measures.WitsmlDayMeasure dayTarget = updatedWellbores.First().Wellbores.First().DayTarget;
            decimal actual = decimal.Parse(dayTarget.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_DayTarget_ThrowsException()
        {
            ModifyWellboreJob job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Measure.DayMeasure { Value = 10, Uom = string.Empty };

            InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
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
