using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    /// <summary>
    /// Job for modifying logCurveInfo.
    /// </summary>
    public record ModifyLogCurveInfoJob : Job
    {
        /// <summary>
        /// ObjectReference API model.
        /// </summary>
        public ObjectReference LogReference { get; init; }

        /// <summary>
        /// LogCurveInfo API model.
        /// </summary>
        public LogCurveInfo LogCurveInfo { get; init; }

        /// <summary>
        /// Getting description of modified LogCurveInfo.
        /// </summary>
        /// <returns></returns>
        public override string Description()
        {
            return $"ToModify - {LogReference.Description()} LogCurveInfoUid: {LogCurveInfo.Uid};";
        }

        /// <summary>
        /// Getting name of log.
        /// </summary>
        /// <returns>String of log name.</returns>
        public override string GetObjectName()
        {
            return LogReference.Name;
        }

        /// <summary>
        /// Getting name of wellbore.
        /// </summary>
        /// <returns>String of wellbore name.</returns>
        public override string GetWellboreName()
        {
            return LogReference.WellboreName;
        }

        /// <summary>
        /// Getting name of well. 
        /// </summary>
        /// <returns>String of well name.</returns>
        public override string GetWellName()
        {
            return LogReference.WellName;
        }
    }
}
