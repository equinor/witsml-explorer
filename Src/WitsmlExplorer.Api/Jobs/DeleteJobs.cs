using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteComponentsJob : IDeleteJob<ComponentReferences> { }
    public record DeleteObjectsJob : IDeleteJob<ObjectReferences> { }
    public record DeleteWellboreJob : IDeleteJob<WellboreReference> { }
    public record DeleteWellJob : IDeleteJob<WellReference> { }
}
