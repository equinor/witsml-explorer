using System.Collections.Generic;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    /// <summary>
    /// Imports a LAS file that has previously been uploaded in chunks through the /uploads endpoints.
    /// </summary>
    public record ImportLasFileJob : Job
    {
        public ObjectReference TargetLog { get; init; }
        public string UploadId { get; init; }

        /// <summary>Optional subset of LAS curve mnemonics to import. All curves are imported when empty.</summary>
        public ICollection<string> Mnemonics { get; init; }

        /// <summary>Optional .NET/date-fns compatible format of the index column for time based logs.</summary>
        public string DateTimeFormat { get; init; }

        public override string Description()
        {
            return $"Import LAS File - To: {TargetLog.Description()}";
        }

        public override string GetObjectName()
        {
            return TargetLog.GetObjectName();
        }

        public override string GetWellboreName()
        {
            return TargetLog.GetWellboreName();
        }

        public override string GetWellName()
        {
            return TargetLog.GetWellName();
        }
    }
}
