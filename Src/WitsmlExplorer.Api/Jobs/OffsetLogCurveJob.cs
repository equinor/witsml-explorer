using System;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record OffsetLogCurveJob : Job
    {
        public ComponentReferences LogCurveInfoReferences { get; init; }
        public double? DepthOffset { get; init; }
        public long? TimeOffsetMilliseconds { get; set; }

        public override string Description()
        {
            TimeSpan timeOffset = TimeSpan.FromMilliseconds(TimeOffsetMilliseconds ?? 0);
            return $"ToOffset - {LogCurveInfoReferences.Description()}; DepthOffset: {DepthOffset}; TimeOffset: {timeOffset};";
        }

        public override string GetObjectName()
        {
            return LogCurveInfoReferences.GetObjectName();
        }

        public override string GetWellboreName()
        {
            return LogCurveInfoReferences.GetWellboreName();
        }

        public override string GetWellName()
        {
            return LogCurveInfoReferences.GetWellName();
        }
    }
}
