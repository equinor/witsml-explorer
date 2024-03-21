using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class BaseReport
    {
        public string Title { get; set; }
        public string Summary { get; init; }
        public IEnumerable<object> ReportItems { get; init; }
        public string WarningMessage { get; init; }
        public bool DownloadImmediately { get; init; } = false;
        public string ReportHeader { get; init; }
    }
}
