using Witsml.Data;

using WitsmlExplorer.Api.Jobs.Common.Interfaces;

namespace WitsmlExplorer.Api.Models
{
    public abstract class ObjectOnWellbore : IObjectReference
    {
        public string Uid { get; init; }
        public string WellUid { get; init; }
        public string WellboreUid { get; init; }
        public string Name { get; set; }
        public string WellName { get; init; }
        public string WellboreName { get; init; }
        public abstract IWitsmlQueryType ToWitsml();
    }
}
