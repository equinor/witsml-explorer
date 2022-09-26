using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteBhaRunsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteLogObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMessageObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMnemonicsJob : IDeleteJob<LogCurvesReference> { }
    public record DeleteRigsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteRisksJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMudLogJob : IDeleteJob<ObjectReference> { }
    public record DeleteTrajectoriesJob : IDeleteJob<ObjectReferences> { }
    public record DeleteTrajectoryStationsJob : IDeleteJob<TrajectoryStationReferences> { }
    public record DeleteTubularComponentsJob : IDeleteJob<TubularComponentReferences> { }
    public record DeleteTubularsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteWbGeometryJob : IDeleteJob<ObjectReferences> { }
    public record DeleteWellboreJob : IDeleteJob<WellboreReference> { }
    public record DeleteWellJob : IDeleteJob<WellReference> { }

}
