using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyComponentsJob : ICopyJob<ComponentReferences, ObjectReference>
    {
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }

    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference>
    {
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;

        /// <summary>
        /// Target object Uid - only for log duplication purposes
        /// </summary>
        public string TargetObjectUid { get; init; }

        /// <summary>
        /// Target object name - only for log duplication purposes
        /// </summary>
        public string TargetObjectName { get; init; }

    }

    public record CopyLogDataJob : ICopyJob<ComponentReferences, ObjectReference>
    {
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;

        public override string Description()
        {
            string startIndexDesc = string.IsNullOrEmpty(StartIndex) ? "" : $"\t\nStartIndex: {StartIndex};";
            string endIndexDesc = string.IsNullOrEmpty(EndIndex) ? "" : $"\t\nEndIndex: {EndIndex};";
            return $"{base.Description()}{startIndexDesc}{endIndexDesc}";
        }
    }

    public record CopyWellJob : ICopyJob<WellReference, WellReference>
    {
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }

    public record
        CopyWellboreJob : ICopyJob<WellboreReference, WellboreReference>
    {
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }

    public record
        CopyWellboreWithObjectsJob : ICopyJob<WellboreReference, WellboreReference>
    {
        public override string GetWellName()
        {
            return $"Source={Source.WellName} Target={Target.WellName}";
        }
        public override string GetWellboreName()
        {
            return $"Source={Source.WellboreName} Target={Target.WellboreName}";
        }
        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }

    public record CopyWithParentJob : ICopyJob<ObjectReferences, WellboreReference>
    {
        public override string GetObjectName()
        {
            return GetType().Name;
        }
        public CopyWellJob CopyWellJob { get; init; }

        public CopyWellboreJob CopyWellboreJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - Source - {Source.Description()}\t\nTarget - {Target.Description()}";
        }

        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }
}
