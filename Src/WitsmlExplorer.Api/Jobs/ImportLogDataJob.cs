using System.Collections.Generic;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record ImportLogDataJob : Job
    {
        public ObjectReference TargetLog { get; init; }
        public IEnumerable<string> Mnemonics { get; init; }
        public IEnumerable<string> Units { get; init; }
        public IEnumerable<IEnumerable<string>> DataRows { get; init; }

        public override string Description()
        {
            return $"Import Log Data - To: {TargetLog.Description()} Mnemonics: {string.Join(", ", Mnemonics)}";
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
