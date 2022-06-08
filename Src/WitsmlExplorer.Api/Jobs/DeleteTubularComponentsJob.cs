using WitsmlExplorer.Api.Jobs.Common;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTubularComponentsJob
    {
        public TubularReference Tubular { get; init; }
        public IEnumerable<string> Uids { get; init; }
    }
}
