using System;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class MinimumDataQcReport : BaseReport
    {
        public LogObject LogReference { get; init; }
    }

    public static class QcIssue
    {
        public const string LARGE_GAP = "large gap";
        public const string LOW_DENSITY = "low density";
        public const string NO_DATA = "no data";
        public const string NOT_FOUND = "not found";
    }

    public class MinimumDataQcReportItem
    {
        public MinimumDataQcReportItem()
        {
            QcIssues = new List<string>();
        }

        public string Mnemonic { get; set; }
        public ICollection<string> QcIssues { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
