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
        public IEnumerable<ReportItemColumn> ReportItemColumns { get; init; }
    }

    public class ReportFileData
    {
        public string FileName { get; init; }
        public string FileContent { get; init; }
    }

    public static class ReportItemType
    {
        public const string STRING = "string";
        public const string NUMBER = "number";
        public const string DATE_TIME = "datetime";
        public const string MEASURE = "measure";
    }

    public struct ReportItemColumn
    {
        public string Name { get; init; }
        public string Type { get; init; }
    }
}
