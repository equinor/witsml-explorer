using System.Collections.Generic;
using System.Linq;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    /// <summary>
    /// Job for batch modification of logCurveInfo.
    /// </summary>
    public record BatchModifyLogCurveInfoJob : Job
    {
        /// <summary>
        /// WellboreReference API model.
        /// </summary>
        public WellboreReference WellboreReference { get; init; }

        /// <summary>
        /// Edited logCurveInfo API model.
        /// </summary>
        public LogCurveInfo EditedLogCurveInfo { get; init; }

        /// <summary>
        /// Collection of logCurveInfos and log Uids API models.
        /// </summary>
        public ICollection<LogCurveInfoBatchItem> LogCurveInfoBatchItems
        {
            get;
            init;
        }

        /// <summary>
        /// Getting a description of batch-modified LogCurveInfos.
        /// </summary>
        /// <returns></returns>
        public override string Description()
        {
            return $"To Batch Modify - Uids: {string.Join(", ", LogCurveInfoBatchItems.Select(batchItem => batchItem.LogCurveInfoUid))}";
        }

        /// <summary>
        /// Getting name of logCurveInfo.
        /// </summary>
        /// <returns>null</returns>
        public override string GetObjectName()
        {
            return null;
        }

        /// <summary>
        /// Getting name of wellbore.
        /// </summary>
        /// <returns>String of wellbore name.</returns>
        public override string GetWellboreName()
        {
            return WellboreReference.WellboreName;
        }

        /// <summary>
        /// Getting name of well.
        /// </summary>
        /// <returns>String of well name.</returns>
        public override string GetWellName()
        {
            return WellboreReference.WellName;
        }
    }
}
