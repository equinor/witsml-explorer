using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteBhaRunsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteLogObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMessageObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMnemonicsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteRigsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteRisksJob : IDeleteJob<ObjectReferences> { }
    public record DeleteMudLogJob : IDeleteJob<ObjectReference> { }
    public record DeleteTrajectoriesJob : IDeleteJob<ObjectReferences> { }
    public record DeleteTrajectoryStationsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteTubularComponentsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteTubularsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteWbGeometryJob : IDeleteJob<ObjectReferences> { }
    public record DeleteWbGeometrySectionsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteWellboreJob : IDeleteJob<WellboreReference> { }
    public record DeleteWellJob : IDeleteJob<WellReference> { }

}
