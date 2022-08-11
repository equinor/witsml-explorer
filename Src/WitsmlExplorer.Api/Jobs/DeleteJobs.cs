using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteBhaRunsJob : IDeleteJob<BhaRunReferences> { }
    public record DeleteLogObjectsJob : IDeleteJob<LogReferences> { }
    public record DeleteMnemonicsJob : IDeleteJob<LogCurvesReference> { }
    public record DeleteRigsJob : IDeleteJob<RigReferences> { }
    public record DeleteRisksJob : IDeleteJob<RiskReferences> { }
    public record DeleteMudLogJob : IDeleteJob<MudLogReference> { }
    public record DeleteTrajectoryJob : IDeleteJob<TrajectoryReference> { }
    public record DeleteTrajectoryStationsJob : IDeleteJob<TrajectoryStationReferences> { }
    public record DeleteTubularComponentsJob : IDeleteJob<TubularComponentReferences> { }
    public record DeleteTubularsJob : IDeleteJob<TubularReferences> { }
    public record DeleteWbGeometryJob : IDeleteJob<WbGeometryReferences> { }
    public record DeleteWellboreJob : IDeleteJob<WellboreReference> { }
    public record DeleteWellJob : IDeleteJob<WellReference> { }

}
