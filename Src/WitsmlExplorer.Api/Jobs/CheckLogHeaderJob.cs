using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CheckLogHeaderJob : Job
    {
        public LogObject LogReference { get; init; }

        public override string Description()
        {
            return $"Check Log Headers - Log: {LogReference.Name}";
        }

        public override string GetObjectName()
        {
            return LogReference.Name;
        }

        public override string GetWellboreName()
        {
            return LogReference.WellboreName;
        }

        public override string GetWellName()
        {
            return LogReference.WellName;
        }
    }
}
