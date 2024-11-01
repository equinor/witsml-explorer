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
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers;

/// <summary>
/// Create new trajectory tests.
/// </summary>
public class CreateTrajectoryWorkerTests
{
    private const string Uid = "newTrajectoryUid";
    private const string Name = "newTrajectoryName";
    private const string WellUid = "wellUid";
    private const string WellName = "wellName";
    private const string WellboreUid = "wellboreUid";

    private readonly Mock<IWitsmlClient> _witsmlClient;
    private readonly CreateObjectOnWellboreWorker _worker;

    public CreateTrajectoryWorkerTests()
    {
        Mock<IWitsmlClientProvider> witsmlClientProvider = new();
        _witsmlClient = new Mock<IWitsmlClient>();
        witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        ILoggerFactory loggerFactory = new LoggerFactory();
        loggerFactory.AddSerilog(Log.Logger);
        ILogger<CreateObjectOnWellboreJob> logger = loggerFactory.CreateLogger<CreateObjectOnWellboreJob>();
        _worker = new CreateObjectOnWellboreWorker(logger, witsmlClientProvider.Object);
    }

    [Fact]
    public async Task CreateTrajectory_Execute_MissingUid_InvalidOperationException()
    {
        CreateObjectOnWellboreJob job = CreateJobTemplate(uid: null);
        var (workerResult, _) = await _worker.Execute(job);
        Assert.False(workerResult.IsSuccess);
        Assert.Equal("Uid cannot be null", workerResult.Message);
        job = CreateJobTemplate(uid: string.Empty);
        (workerResult, _) = await _worker.Execute(job);
        Assert.False(workerResult.IsSuccess);
        Assert.Equal("Uid cannot be empty", workerResult.Message);
        _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlTrajectories>()), Times.Never);
    }

    [Fact]
    public async Task CreateTrajectory_Execute_MissingName_InvalidOperationException()
    {
        CreateObjectOnWellboreJob job = CreateJobTemplate(name: null);
        var (workerResult, _) = await _worker.Execute(job);
        Assert.False(workerResult.IsSuccess);
        Assert.Equal("Name cannot be null", workerResult.Message);
        job = CreateJobTemplate(name: string.Empty);
        (workerResult, _) = await _worker.Execute(job);
        Assert.False(workerResult.IsSuccess);
        Assert.Equal("Name cannot be empty", workerResult.Message);
        _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlTrajectories>()), Times.Never);
    }


    [Fact]
    public async Task CreateTrajectory_Execute_ValidResults()
    {
        CreateObjectOnWellboreJob job = CreateJobTemplate();
        List<WitsmlTrajectories> createdTrajectories = new();

        _witsmlClient.Setup(client =>
                client.AddToStoreAsync(It.IsAny<IWitsmlQueryType>()))
            .Callback<IWitsmlQueryType>(trajectory => createdTrajectories.Add(trajectory as WitsmlTrajectories))
            .ReturnsAsync(new QueryResult(true));

        await _worker.Execute(job);

        Assert.Single(createdTrajectories);
        Assert.Single(createdTrajectories.First().Trajectories);
        WitsmlTrajectory createdObject = createdTrajectories.First().Trajectories.First();
        Assert.Equal(Uid, createdObject.Uid);
        Assert.Equal(Name, createdObject.Name);
        Assert.Equal(WellUid, createdObject.UidWell);
        Assert.Equal(WellName, createdObject.NameWell);
        Assert.Equal(WellboreUid, createdObject.UidWellbore);
    }

    private static CreateObjectOnWellboreJob CreateJobTemplate(string uid = Uid, string name = Name, string wellUid = WellUid, string wellName = WellName, string wellboreUid = WellboreUid)
    {
        return new CreateObjectOnWellboreJob
        {
            Object = new Trajectory()
            {
                Uid = uid,
                Name = name,
                WellUid = wellUid,
                WellName = wellName,
                WellboreUid = wellboreUid
            },
            ObjectType = EntityType.Trajectory
        };
    }
}
