using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class LogCurvePriorities
    {
        public IList<string> PrioritizedCurves { get; set; }
        public IList<string> PrioritizedGlobalCurves { get; set; }
    }
}
