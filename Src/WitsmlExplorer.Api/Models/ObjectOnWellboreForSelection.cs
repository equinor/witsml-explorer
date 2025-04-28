using Witsml.Data;

using WitsmlExplorer.Api.Jobs.Common.Interfaces;

namespace WitsmlExplorer.Api.Models
{
    public class ObjectOnWellboreForSelection
    {
        public string ObjectType { get; init; }
        public string LogType { get; init; }
        public string Uid { get; init; }
        public string Name { get; init; }
    }
}
