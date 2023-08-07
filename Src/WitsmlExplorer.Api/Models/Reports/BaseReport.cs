using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class BaseReport
    {
        public string Title { get; set; }
        public string Summary { get; init; }
        public IEnumerable<object> ReportItems { get; init; }
    }
}
