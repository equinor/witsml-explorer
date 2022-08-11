using System.Collections.Generic;
using System.Text;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class LogCurvesReference : IReference
    {
        public LogReference LogReference { get; set; }
        public IEnumerable<string> Mnemonics { get; set; } = new List<string>();

        public string Description()
        {
            var desc = new StringBuilder();
            desc.Append($"{LogReference.Description()}");
            desc.Append($"Mnemonics: {string.Join(", ", Mnemonics)}; ");
            return desc.ToString();
        }
    }
}
