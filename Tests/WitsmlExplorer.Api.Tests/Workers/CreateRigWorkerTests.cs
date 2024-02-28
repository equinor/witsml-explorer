using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data.Rig;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers;

/// <summary>
/// Create new rig tests.
/// </summary>
public class CreateRigWorkerTests
{
    private const string Uid = "newRigUid";
    private const string Name = "newRigName";
    private const string WellUid = "wellUid";
    private const string WellName = "wellName";
    private const string WellboreUid = "wellboreUid";

    private readonly Mock<IWitsmlClient> _witsmlClient;
    private readonly CreateRigWorker _worker;

    public CreateRigWorkerTests()
    {
        Mock<IWitsmlClientProvider> witsmlClientProvider = new();
        _witsmlClient = new Mock<IWitsmlClient>();
        witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        ILoggerFactory loggerFactory = new LoggerFactory();
        loggerFactory.AddSerilog(Log.Logger);
        ILogger<CreateRigJob> logger = loggerFactory.CreateLogger<CreateRigJob>();
        _worker = new CreateRigWorker(logger, witsmlClientProvider.Object);
    }

    [Fact]
    public async Task CreateRig_Execute_MissingUid_InvalidOperationException()
    {
        CreateRigJob job = CreateJobTemplate(uid: null);
        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("Uid cannot be empty", exception.Message);
        job = CreateJobTemplate(uid: string.Empty);
        exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("Uid cannot be empty", exception.Message);
        _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlRigs>()), Times.Never);
    }

    [Fact]
    public async Task CreateRig_Execute_MissingName_InvalidOperationException()
    {
        CreateRigJob job = CreateJobTemplate(name: null);
        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("Name cannot be empty", exception.Message);
        job = CreateJobTemplate(name: string.Empty);
        exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("Name cannot be empty", exception.Message);
        _witsmlClient.Verify(client => client.AddToStoreAsync(It.IsAny<WitsmlRigs>()), Times.Never);
    }


    [Fact]
    public async Task CreateRig_Execute_ValidResults()
    {
        CreateRigJob job = CreateJobTemplate();
        List<WitsmlRigs> createdRigs = new();

        _witsmlClient.Setup(client =>
                client.AddToStoreAsync(It.IsAny<WitsmlRigs>()))
            .Callback<WitsmlRigs>(rig => createdRigs.Add(rig))
            .ReturnsAsync(new QueryResult(true));

        await _worker.Execute(job);

        Assert.Single(createdRigs);
        Assert.Single(createdRigs.First().Rigs);
        WitsmlRig createdRig = createdRigs.First().Rigs.First();
        Assert.Equal(Uid, createdRig.Uid);
        Assert.Equal(Name, createdRig.Name);
        Assert.Equal(WellUid, createdRig.UidWell);
        Assert.Equal(WellName, createdRig.NameWell);
        Assert.Equal(WellboreUid, createdRig.UidWellbore);
    }

    private static CreateRigJob CreateJobTemplate(string uid = Uid, string name = Name, string wellUid = WellUid, string wellName = WellName, string wellboreUid = WellboreUid)
    {
        return new CreateRigJob
        {
            Rig = new Rig()
            {
                Uid = uid,
                Name = name,
                WellUid = wellUid,
                WellName = wellName,
                WellboreUid = wellboreUid,
                CommonData = new CommonData
                {
                    ItemState = "plan",
                    SourceName = "sourceName"
                }
            }
        };
    }
}
