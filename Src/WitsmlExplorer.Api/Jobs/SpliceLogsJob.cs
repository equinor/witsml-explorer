using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record SpliceLogsJob : Job
    {
        public ObjectReferences Logs { get; init; }
        public string NewLogName { get; init; }
        public string NewLogUid { get; init; }

        public override string Description()
        {
            return $"Splice logs - WellUid: {Logs.WellUid}; WellboreUid: {Logs.WellboreUid}; Uids: {string.Join(", ", Logs.ObjectUids)};";
        }

        public override string GetObjectName()
        {
            return string.Join(", ", Logs.Names);
        }

        public override string GetWellboreName()
        {
            return Logs.WellboreName;
        }

        public override string GetWellName()
        {
            return Logs.WellName;
        }

        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }
}
