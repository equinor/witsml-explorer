using System.Collections.Generic;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogCurvesReference : IReference
    {
        public ObjectReference LogReference { get; set; }
        public IEnumerable<string> Mnemonics { get; set; } = new List<string>();

        public string Description()
        {
            StringBuilder desc = new();
            desc.Append($"{LogReference.Description()}");
            desc.Append($"Mnemonics: {string.Join(", ", Mnemonics)}; ");
            return desc.ToString();
        }
    }
}
