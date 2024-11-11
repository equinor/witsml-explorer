using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models.Reports
{
    public class BaseReport
    {
        public string Title { get; set; }
        public string Summary { get; init; }
        public IEnumerable<object> ReportItems { get; init; }
        public string WarningMessage { get; init; }
        public bool HasFile { get; init; } = false;
        public string JobDetails { get; init; }
        [JsonIgnore]
        public ReportFileData FileData { get; init; }
    }

    public class ReportFileData
    {
        public string FileName { get; init; }
        public string FileContent { get; init; }
    }
}
