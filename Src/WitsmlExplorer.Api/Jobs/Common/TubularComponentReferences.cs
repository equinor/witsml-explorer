using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TubularComponentReferences
    {
        public TubularReference TubularReference { get; set; }
        public IEnumerable<string> TubularComponentUids { get; set; } = new List<string>();
    }
}
