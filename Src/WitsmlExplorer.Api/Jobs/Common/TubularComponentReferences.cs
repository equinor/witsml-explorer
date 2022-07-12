using System.Collections.Generic;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TubularComponentReferences : IReference
    {
        public TubularReference TubularReference { get; set; }
        public IEnumerable<string> TubularComponentUids { get; set; } = new List<string>();

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"{TubularReference.Description()}");
            desc.Append($"TubularComponentUids: {string.Join(", ", TubularComponentUids)}; ");
            return desc.ToString();
        }
    }
}
