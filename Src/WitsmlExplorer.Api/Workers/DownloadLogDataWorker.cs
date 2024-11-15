using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for downloading log data.
/// </summary>
public class DownloadLogDataWorker : BaseWorker<DownloadLogDataJob>, IWorker
{
    public JobType JobType => JobType.DownloadLogData;
    private readonly ILogObjectService _logObjectService;
    private readonly IWellService _wellService;
    private readonly char _newLineCharacter = '\n';
    private readonly char _separator = ',';

    public DownloadLogDataWorker(
            ILogger<DownloadLogDataJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            ILogObjectService logObjectService,
            IWellService wellService)
            : base(witsmlClientProvider, logger)
    {
        _logObjectService = logObjectService;
        _wellService = wellService;
    }
    /// <summary>
    /// Downaloads all log data and generates a report.
    /// </summary>
    /// <param name="job">The job model contains job-specific parameters.</param>
    /// <returns>Task of the workerResult in a report with all log data.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(DownloadLogDataJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Downloading of all data started. {jobDescription}", job.Description());
        IProgress<double> progressReporter = new Progress<double>(progress =>
        {
            job.ProgressReporter?.Report(progress);
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
        });

        if (!string.IsNullOrEmpty(job.StartIndex))
        {
            job.LogReference.StartIndex = job.StartIndex;
        }

        if (!string.IsNullOrEmpty(job.EndIndex))
        {
            job.LogReference.EndIndex = job.EndIndex;
        }

        var logData = await _logObjectService.ReadLogData(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid, job.Mnemonics.ToList(), job.StartIndexIsInclusive, job.LogReference.StartIndex, job.LogReference.EndIndex, true, cancellationToken, progressReporter);
        var well = await _wellService.GetWell(job.LogReference.WellUid);
        return (job.ExportToLas)
            ? DownloadLogDataResultLasFile(job, logData.Data,
                logData.CurveSpecifications, well)
            : DownloadLogDataResultCvsFile(job, logData.Data,
                logData.CurveSpecifications);
    }

    private (WorkerResult, RefreshAction) DownloadLogDataResultCvsFile(DownloadLogDataJob job, ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        Logger.LogInformation("Download of all data is done. {jobDescription}", job.Description());
        string content = GetCsvFileContent(reportItems, curveSpecifications);
        job.JobInfo.Report = DownloadLogDataReport(job.LogReference, content, "csv");
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Download of all data is ready, jobId: ", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private (WorkerResult, RefreshAction) DownloadLogDataResultLasFile(DownloadLogDataJob job, ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications, Well well)
    {
        Logger.LogInformation("Download of all data is done. {jobDescription}", job.Description());
        var columnLengths = CalculateColumnLength(reportItems,
            curveSpecifications);
        var maxDataLenght = CalculateMaxDataLenght(well);
        var maxHeaderLength =
            CalculateMaxHeaderLength(curveSpecifications);
        using var writer = new StringWriter();
        WriteLogCommonInformation(writer, maxHeaderLength, maxDataLenght);
        var limitValues = GetLimitValues(curveSpecifications, reportItems);
        WriteWellInformationSection(writer, well, maxHeaderLength, maxDataLenght, limitValues);
        WriteLogDefinitionSection(writer, curveSpecifications, maxHeaderLength, maxDataLenght);
        WriteColumnHeaderSection(writer, curveSpecifications, columnLengths);
        WriteDataSection(writer, reportItems, curveSpecifications, columnLengths);
        string content = writer.ToString();
        job.JobInfo.Report = DownloadLogDataReport(job.LogReference, content, "las");
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Download of all data is ready, jobId: ", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private DownloadLogDataReport DownloadLogDataReport(LogObject logReference, string fileContent, string fileExtension)
    {
        return new DownloadLogDataReport
        {
            Title = $"{logReference.WellboreName} - {logReference.Name}",
            Summary = "The download will start automatically. You can also access the download link in the Jobs view.",
            LogReference = logReference,
            HasFile = true,
            FileData = new ReportFileData
            {
                FileName = $"{logReference.WellboreName}-{logReference.Name}.{fileExtension}",
                FileContent = fileContent
            }
        };
    }

    private string GetCsvFileContent(ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        return $"{GetReportHeader(curveSpecifications)}\n{GetReportBody(reportItems, curveSpecifications)}";
    }

    private string GetReportHeader(ICollection<CurveSpecification> curveSpecifications)
    {
        var listOfHeaders = new List<string>();
        foreach (CurveSpecification curveSpec in curveSpecifications)
        {
            listOfHeaders.Add($"{curveSpec.Mnemonic}[{curveSpec.Unit}]");
        }
        return string.Join(',', listOfHeaders);
    }

    private string GetReportBody(ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        var mnemonics = curveSpecifications.Select(spec => spec.Mnemonic).ToList();
        var body = string.Join(_newLineCharacter,
            reportItems.Select(row =>
                string.Join(_separator, mnemonics.Select(mnemonic =>
                    row.TryGetValue(mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : string.Empty
                ))
            )
        );
        return body;
    }

    private Dictionary<string, int> CalculateColumnLength(ICollection<Dictionary<string, LogDataValue>> data, ICollection<CurveSpecification> curveSpecifications)
    {
        var result = new Dictionary<string, int>();
        foreach (var curveSpecification in curveSpecifications)
        {
            var oneColumn = data.Select(row =>

                row.TryGetValue(curveSpecification.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()!.Length
                    : 0
            ).Max();
            result[curveSpecification.Mnemonic] = (curveSpecification.Mnemonic.Length + curveSpecification.Unit.Length + 3) > oneColumn ? curveSpecification.Mnemonic.Length + curveSpecification.Unit.Length + 3 : oneColumn;
        }
        return result;
    }

    private int CalculateMaxDataLenght(Well well)
    {
        // long date time string, possible the biggest value
        var result = 28;
        Type objType = typeof(Well);
        PropertyInfo[] properties = objType.GetProperties();
        foreach (var property in properties)
        {
            var value = property.GetValue(well);
            if (value != null)
            {
                if (value.ToString().Length > result)
                {
                    result = value.ToString().Length;
                }
            }
        }
        return result;
    }

    private int CalculateMaxHeaderLength(
        ICollection<CurveSpecification> curveSpecifications)
    {
        var result = 0;
        foreach (var curveSpecification in curveSpecifications)
        {
            if ((curveSpecification.Mnemonic.Length +
                 curveSpecification.Unit.Length) > result)
                result = curveSpecification.Mnemonic.Length +
                         curveSpecification.Unit.Length;
        }
        return result;
    }

    private LimitValues GetLimitValues(ICollection<CurveSpecification> curveSpecifications,
        ICollection<Dictionary<string, LogDataValue>> data)
    {
        var curveSpecificationDepth =
            curveSpecifications.FirstOrDefault(x => x.Mnemonic.ToLower() == "depth");
        var curveSpecificationTime = curveSpecifications.FirstOrDefault(x => x.Mnemonic.ToLower() == "time");
        var isDepthBasedSeries = curveSpecificationDepth != null;
        var result = new LimitValues();
        if (curveSpecificationDepth == null && curveSpecificationTime == null)
            return result;
        var oneColumn = isDepthBasedSeries
            ? data.Select(row =>

                row.TryGetValue(curveSpecificationDepth.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : "0"
            ).ToList()
            : data.Select(row =>
                row.TryGetValue(curveSpecificationTime.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : DateTime.Now.ToString(CultureInfo.InvariantCulture)
            ).ToList();
        var firstValue = oneColumn.First();
        var lastValue = oneColumn.Last();
        result.Start = firstValue;
        result.Stop = lastValue;
        result.Step = CalculateStep(oneColumn, firstValue, isDepthBasedSeries);
        result.Unit = isDepthBasedSeries
            ? curveSpecificationDepth.Unit
            : curveSpecificationTime.Unit;
        result.LogType = isDepthBasedSeries
            ? "DEPTH"
            : "TIME";
        return result;
    }

    private string CalculateStep(List<string> oneColumn, string firstValue, bool isDepthBasedSeries)
    {
        var result = string.Empty;
        foreach (var row in oneColumn)
        {
            if (firstValue == row)
            {
                continue;
            }

            result = isDepthBasedSeries ? CalculateStepDepth(row, firstValue) : CalculateStepTime(row, firstValue);
            if (result == string.Empty)
                return result;
            firstValue = row;
        }
        return result;
    }

    private string CalculateStepTime(string row, string firstValue)
    {
        var secondValue = StringHelpers.ToDateTime(row);
        var difference = secondValue -
                         StringHelpers.ToDateTime(firstValue);
        var newDifference = StringHelpers.ToDateTime(row) - StringHelpers.ToDateTime(firstValue);
        if (difference != newDifference)
        {
            return string.Empty;
        }
        return difference.ToString();
    }

    private string CalculateStepDepth(string row, string firstValue)
    {
        var secondValue = StringHelpers.ToDecimal(row);
        var difference = secondValue -
                         StringHelpers.ToDecimal(firstValue);
        var newDifference = StringHelpers.ToDecimal(row) - StringHelpers.ToDecimal(firstValue);
        if (difference != newDifference)
        {
            return string.Empty;
        }
        return difference.ToString(CultureInfo.InvariantCulture);
    }

    private void WriteLogCommonInformation(StringWriter writer, int maxColumnLenght, int maxDataLength)
    {
        writer.WriteLine("~VERSION INFORMATION");
        WriteCommonParameter(writer, "VERS.", "2.0", "CWLS LOG ASCII STANDARD - VERSION 2.0", maxColumnLenght, maxDataLength);
        WriteCommonParameter(writer, "WRAP.", "NO", "ONE LINE PER STEP", maxColumnLenght, maxDataLength);
        WriteCommonParameter(writer, "PROD.", "Equinor", "LAS Producer", maxColumnLenght, maxDataLength);
        WriteCommonParameter(writer, "PROG.", "WITSML Explorer", "LAS Program name", maxColumnLenght, maxDataLength);
        WriteCommonParameter(writer, "CREA.", DateTime.Now.ToShortDateString(), "LAS Creation date", maxColumnLenght, maxDataLength);
    }
    private void WriteLogDefinitionSection(StringWriter writer, ICollection<CurveSpecification> curveSpecifications, int maxColumnLenght, int maxDataLenght)
    {
        writer.WriteLine("~PARAMETER INFORMATION");
        writer.WriteLine("~CURVE INFORMATION");
        CreateHeader(writer, maxColumnLenght, maxDataLenght, "#MNEM", ".UNIT", "API CODE", "CURVE DESCRIPTION");
        int i = 1;
        foreach (var curveSpecification in curveSpecifications)
        {
            var line = new StringBuilder();
            line.Append(curveSpecification.Mnemonic);
            line.Append(new string(' ', maxColumnLenght - curveSpecification.Mnemonic.Length));
            line.Append($".{curveSpecification.Unit}");
            line.Append(new string(' ', maxColumnLenght - curveSpecification.Unit.Length));
            line.Append(new string(' ', maxDataLenght));
            line.Append($": {i++} ");
            line.Append(curveSpecification.Mnemonic.Replace("_", " "));
            line.Append($" ({curveSpecification.Unit})");
            writer.WriteLine(line.ToString());
        }
    }

    private void CreateHeader(StringWriter writer, int maxColumnLenght, int maxDataLenght, string firstColumn, string secondColumn, string thirdColumn, string fourthColumn)
    {
        var header = new StringBuilder();
        var secondHeader = new StringBuilder();
        header.Append(firstColumn);
        secondHeader.Append('#');
        secondHeader.Append(new string('-', firstColumn.Length -1 ));
        if (maxColumnLenght > firstColumn.Length)
        {
            header.Append(new string(' ', maxColumnLenght - firstColumn.Length));
            secondHeader.Append(new string(' ', maxColumnLenght - firstColumn.Length));
        }
        header.Append(secondColumn);
        secondHeader.Append(new string('-', secondColumn.Length));
        if (maxColumnLenght > secondColumn.Length)
        {
            header.Append(new string(' ', maxColumnLenght - secondColumn.Length));
            secondHeader.Append(new string(' ', maxColumnLenght - secondColumn.Length));
        }
        header.Append(thirdColumn);
        secondHeader.Append(new string('-', thirdColumn.Length));
        if (maxDataLenght > thirdColumn.Length)
        {
            header.Append(new string(' ', maxDataLenght - thirdColumn.Length + 1));
            secondHeader.Append(new string(' ', maxDataLenght - thirdColumn.Length + 1));
        }
        header.Append(fourthColumn);
        secondHeader.Append(new string('-', fourthColumn.Length));
        writer.WriteLine(header.ToString());
        writer.WriteLine(secondHeader.ToString());
    }

    private void WriteColumnHeaderSection(StringWriter writer, ICollection<CurveSpecification> curveSpecifications, Dictionary<string, int> maxColumnLenghts)
    {
        writer.WriteLine("#");
        writer.WriteLine(
            "#-----------------------------------------------------------");
        int i = 0;
        var line = new StringBuilder();
        foreach (var curveSpecification in curveSpecifications)
        {
            int emptySpaces = maxColumnLenghts[curveSpecification.Mnemonic] -
                              curveSpecification.Mnemonic.Length -
                              curveSpecification.Unit.Length - 3;
            if (i == 0)
            {
                line.Append("# ");
                if (emptySpaces > 2)
                    line.Append(new string(' ', emptySpaces - 2));
            }
            else
            {
                if (emptySpaces > 0)
                    line.Append(new string(' ', emptySpaces));
            }

            line.Append(curveSpecification.Mnemonic);
            line.Append(" (");
            line.Append(curveSpecification.Unit);
            if (i < curveSpecifications.Count)
                line.Append(") ");
            else
            {
                line.Append(')');
            }
            i++;
        }
        writer.WriteLine(line.ToString());
        writer.WriteLine(
            "#-----------------------------------------------------------");
        writer.WriteLine("~A");
    }

    private void WriteWellInformationSection(StringWriter writer, Well well, int maxColumnLength, int maxDataLenght, LimitValues limitValues)
    {
        writer.WriteLine("~WELL INFORMATION BLOCK");
        CreateHeader(writer, maxColumnLength, maxDataLenght, "#MNEM", ".UNIT", "DATA", "DESCRIPTION OF MNEMONIC");
        WriteWellParameter(writer, "STRT", limitValues.Unit, limitValues.Start, $"START {limitValues.LogType}", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "STOP", limitValues.Unit, limitValues.Stop, $"STOP {limitValues.LogType}", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "STEP", limitValues.Unit, limitValues.Step, "STEP VALUE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SNULL", "", "", "NULL VALUE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SCOMP", "", well.Operator, "COMPANY NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SWELL", "", well.Name, "WELL NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SFLD", "", "", "FIELD NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SRIGN", "", "", "RIG NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SRIGTYP", "", "", "RIG TYPE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SSON", "", "", "Service Order Number", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SSRVC", "", "", "SERVICE COMPANY NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SSRVL", "", "", "SERVICE LINE NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLOGC", "", "", "LOGGING COMPANY NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SDEGT", "", "", "DEGASSER TYPE NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SDETT", "", "", "DEECTOR TYPE NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SAPPC", "", "", "APPLIED CORRECTIONS", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SDATE", "", $"{DateTime.Now.ToShortDateString()} {DateTime.Now.ToShortTimeString()}", "DATE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SCLAB", "", "", "County label", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SSLAB", "", "", "State/Province label", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SPROV", "", "", "State or Province", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SCTRY", "", well.Country, "COUNTRY", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SCONT_REGION", "", "", "Continent Region", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SSECT", "", "", "Section", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "STOWN", "", "", "Township", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SRANGE", "", "", "Range", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SAPI", "", "", "API Number", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SUWI", "", "", "UNIQUE WELL IDENTIFIER", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLUL", "", "", "Logging Unit Location", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLUN", "", "", "Logging Unit Number", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLOC", "", "", "Field Location", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SFL1", "", "", "Field Location line 1", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SFL2", "", "", "Field Location line 2", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLATI", "deg", "", "Latitude", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLONG", "deg", "", "Local Permanent Datum", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SPDAT", "", "", "Geodetic Datum", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SGDAT", "", "", "Geodetic Datum", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SLMF", "", "", "Logging Measured From", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SAPD", "", "", "Elevation of Depth Reference (LMF) above Permanent Datum", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SEPD", "", "", "Elevation of Permanent Datum (PDAT) above Mean Sea Level", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SEKD", "", "", "Elevation of Kelly Bushing above Permanent Datum", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SEDF", "", "", "Elevation of Drill Floor above Permanent Datum", maxColumnLength, maxDataLenght);
    }

    private void WriteCommonParameter(StringWriter writer, string nameOfParameter, string data, string description, int maxColumnLength, int maxDataLenght)
    {
        var line = new StringBuilder();
        line.Append(nameOfParameter);
        if (maxColumnLength - nameOfParameter.Length > 0)
        {
            line.Append(new string(' ', maxColumnLength - nameOfParameter.Length));
        }
        line.Append($" {data}");
        if (maxColumnLength - data.Length > 0)
        {
            line.Append(new string(' ', maxColumnLength - data.Length));
        }
        line.Append(new string(' ', maxDataLenght));
        line.Append($":{description}");
        writer.WriteLine(line.ToString());
    }
    private void WriteWellParameter(StringWriter writer, string nameOfParemeter, string unit,
        string data, string description, int maxColumnLength, int maxDataLength)
    {
        var line = new StringBuilder();
        line.Append(nameOfParemeter);
        if (maxColumnLength - nameOfParemeter.Length > 0)
        {
            line.Append(new string(' ', maxColumnLength - nameOfParemeter.Length));
        }
        line.Append($".{unit}");
        if (maxColumnLength - unit.Length - 1 > 0)
        {
            line.Append(new string(' ', maxColumnLength - unit.Length - 1));
        }
        line.Append(data);
        if (maxDataLength - data.Length > 0)
        {
            line.Append(new string(' ', maxDataLength - data.Length));
        }
        line.Append($" :{description}");
        writer.WriteLine(line.ToString());
    }


    private void WriteDataSection(StringWriter writer,
        ICollection<Dictionary<string, LogDataValue>> data, ICollection<CurveSpecification> curveSpecifications, Dictionary<string, int> columnsLength)
    {
        foreach (var row in data)
        {
            var line = new StringBuilder();
            int i = 0;
            foreach (var curveSpecification in curveSpecifications)
            {
                var cell = row.TryGetValue(curveSpecification.Mnemonic, out LogDataValue value)
                        ? value.Value.ToString()
                        : string.Empty;

                int length = columnsLength[curveSpecification.Mnemonic] - cell!.Length;
                if (i == 0 && length != 0)
                {
                    length += 2;
                }
                if (length > 0) line.Append(new string(' ', length));
                line.Append(cell);
                if (i < curveSpecifications.Count - 1) line.Append(' ');
                i++;
            }
            writer.WriteLine(line.ToString());
        }
    }

    private class LimitValues
    {
        public string Start { get; set; }
        public string Stop { get; set; }
        public string Step { get; set; }
        public string Unit { get; set; }
        public string LogType { get; set; }
    }
}
