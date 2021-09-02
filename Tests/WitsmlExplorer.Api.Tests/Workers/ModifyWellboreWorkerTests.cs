using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ModifyWellboreWorkerTests
    {
        private readonly Mock<IWitsmlClient> witsmlClient;
        private readonly ModifyWellboreWorker worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";

        public ModifyWellboreWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            worker = new ModifyWellboreWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task RenameWellbore()
        {
            var expectedNewName = "NewName";
            var job = CreateJobTemplate();
            job.Wellbore.Name = expectedNewName;

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            Assert.Single(updatedWellbores);
            Assert.Equal(expectedNewName, updatedWellbores.First().Wellbores.First().Name);
        }

        [Fact]
        public async Task RenameWellbore_EmptyName_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Name = "";

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("Name cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Md()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.Md = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft"};

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var Md = updatedWellbores.First().Wellbores.First().Md;
            var actual = decimal.Parse(Md.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Md_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Md = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for Md cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_Tvd()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.Tvd = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var Tvd = updatedWellbores.First().Wellbores.First().Tvd;
            var actual = decimal.Parse(Tvd.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_Tvd_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.Tvd = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for Tvd cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdKickoff()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var MdKickoff = updatedWellbores.First().Wellbores.First().MdKickoff;
            var actual = decimal.Parse(MdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdKickoff_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdKickoff = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for MdKickoff cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdKickoff()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var TvdKickoff = updatedWellbores.First().Wellbores.First().TvdKickoff;
            var actual = decimal.Parse(TvdKickoff.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdKickoff_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdKickoff = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for TvdKickoff cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdPlanned()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var MdPlanned = updatedWellbores.First().Wellbores.First().MdPlanned;
            var actual = decimal.Parse(MdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdPlanned = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for MdPlanned cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdPlanned()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var TvdPlanned = updatedWellbores.First().Wellbores.First().TvdPlanned;
            var actual = decimal.Parse(TvdPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdPlanned = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for TvdPlanned cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var MdSubSeaPlanned = updatedWellbores.First().Wellbores.First().MdSubSeaPlanned;
            var actual = decimal.Parse(MdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_MdSubSeaPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.MdSubSeaPlanned = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for MdSubSeaPlanned cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned()
        {
            const int expectedValue = 20;
            var job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Models.Measure.LengthMeasure { Value = expectedValue, Uom = "ft" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var TvdSubSeaPlanned = updatedWellbores.First().Wellbores.First().TvdSubSeaPlanned;
            var actual = decimal.Parse(TvdSubSeaPlanned.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_TvdSubSeaPlanned_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.TvdSubSeaPlanned = new Models.Measure.LengthMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for TvdSubSeaPlanned cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Update_DayTarget()
        {
            const int expectedValue = 10;
            var job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Models.Measure.DayMeasure { Value = expectedValue, Uom = "d" };

            var updatedWellbores = new List<WitsmlWellbores>();
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

            await worker.Execute(job);

            var DayTarget = updatedWellbores.First().Wellbores.First().DayTarget;
            var actual = decimal.Parse(DayTarget.Value);
            Assert.Single(updatedWellbores);
            Assert.Equal(expectedValue, actual);
        }

        [Fact]
        public async Task Update_DayTarget_ThrowsException()
        {
            var job = CreateJobTemplate();
            job.Wellbore.DayTarget = new Models.Measure.DayMeasure { Value = 10, Uom = "" };

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => worker.Execute(job));
            Assert.Equal("unit of measure for DayTarget cannot be empty", exception.Message);

            witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        private ModifyWellboreJob CreateJobTemplate()
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
