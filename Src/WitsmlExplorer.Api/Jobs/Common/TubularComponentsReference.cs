using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TubularComponentsReference
    {
        public string ServerUrl { get; set; }
        public TubularReference TubularReference { get; set; }
        public IEnumerable<string> TubularComponentUids { get; set; } = new List<string>();
    }
}
