using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteGeologyIntervalsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteMnemonicsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteTrajectoryStationsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteTubularComponentsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteWbGeometrySectionsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteWellboreJob : IDeleteJob<WellboreReference> { }
    public record DeleteWellJob : IDeleteJob<WellReference> { }

}
