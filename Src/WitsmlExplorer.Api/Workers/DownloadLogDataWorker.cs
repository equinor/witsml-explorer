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

using Witsml;
using Witsml.Data;

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
        if (logData.CurveSpecifications == null)
        {
            var message = "DownloadLogDataJob failed. No data found in the given range.";
            Logger.LogError(message);
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message, message, jobId: job.JobInfo.Id), null);
        }

        return (job.ExportToLas)
            ? await DownloadLogDataResultLasFile(job, logData.Data,
                logData.CurveSpecifications)
            : DownloadLogDataResultCsvFile(job, logData.Data,
                logData.CurveSpecifications);
    }

    private (WorkerResult, RefreshAction) DownloadLogDataResultCsvFile(DownloadLogDataJob job, ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        Logger.LogInformation("Download of log data is done. {jobDescription}", job.Description());
        string content = GetCsvFileContent(reportItems, curveSpecifications);
        job.JobInfo.Report = DownloadLogDataReport(job.LogReference, content, "csv");
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Download of all data is ready, jobId: ", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private async Task<(WorkerResult, RefreshAction)> DownloadLogDataResultLasFile(DownloadLogDataJob job, ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        Logger.LogInformation("Download of log data is done. {jobDescription}", job.Description());
        var well = await _wellService.GetWell(job.LogReference.WellUid);
        var logObject = await _logObjectService.GetLog(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid);
        var columnLengths = CalculateColumnLength(reportItems,
            curveSpecifications);
        var maxWellDataLength = CalculateMaxWellDataLength(well, logObject);
        var maxHeaderLength =
            CalculateMaxHeaderLength(curveSpecifications);
        await using var writer = new StringWriter();
        WriteLogCommonInformation(writer, maxHeaderLength, maxWellDataLength);
        var limitValues = GetLimitValues(curveSpecifications, reportItems, logObject);
        WriteWellInformationSection(writer, well, logObject, maxHeaderLength, maxWellDataLength, limitValues);
        WriteLogDefinitionSection(writer, curveSpecifications, maxHeaderLength, maxWellDataLength);
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
            var indexCurveColumn = data.Select(row =>

                row.TryGetValue(curveSpecification.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()!.Length
                    : 0
            ).Max();
            result[curveSpecification.Mnemonic] = (curveSpecification.Mnemonic.Length + curveSpecification.Unit.Length + 3) > indexCurveColumn ? curveSpecification.Mnemonic.Length + curveSpecification.Unit.Length + 3 : indexCurveColumn;
        }
        return result;
    }

    private int CalculateMaxWellDataLength(Well well, LogObject logObject)
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

        if (logObject.ServiceCompany != null && logObject.ServiceCompany.Length > result)
            result = logObject.ServiceCompany.Length;
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
        ICollection<Dictionary<string, LogDataValue>> data, LogObject logObject)
    {
        var curveSpecification =
            curveSpecifications.FirstOrDefault(x => string.Equals(x.Mnemonic, logObject.IndexCurve, StringComparison.CurrentCultureIgnoreCase));
        var isDepthBasedSeries = logObject.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
        var result = new LimitValues();
        if (curveSpecification == null)
            return result;
        var indexCurveColumn = isDepthBasedSeries
            ? data.Select(row =>

                row.TryGetValue(curveSpecification.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : "0"
            ).ToList()
            : data.Select(row =>
                row.TryGetValue(curveSpecification.Mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : DateTime.Now.ToString(CultureInfo.InvariantCulture)
            ).ToList();
        var firstValue = indexCurveColumn.First();
        result.Start = firstValue;
        result.Stop = indexCurveColumn.Last();
        result.Step = CalculateStep(indexCurveColumn, firstValue, isDepthBasedSeries);
        result.Unit = curveSpecification.Unit;
        result.LogType = isDepthBasedSeries
            ? "DEPTH"
            : "TIME";
        return result;
    }

    private string CalculateStep(List<string> indexCurveColumn, string firstValue, bool isDepthBasedSeries)
    {
        var result = string.Empty;
        foreach (var row in indexCurveColumn)
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
        secondHeader.Append(new string('-', firstColumn.Length - 1));
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

    private void WriteWellInformationSection(StringWriter writer, Well well, LogObject logObject, int maxColumnLength, int maxDataLenght, LimitValues limitValues)
    {
        writer.WriteLine("~WELL INFORMATION");
        CreateHeader(writer, maxColumnLength, maxDataLenght, "#MNEM", ".UNIT", "DATA", "DESCRIPTION OF MNEMONIC");
        WriteWellParameter(writer, "STRT", limitValues.Unit, limitValues.Start, $"START {limitValues.LogType}", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "STOP", limitValues.Unit, limitValues.Stop, $"STOP {limitValues.LogType}", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "STEP", limitValues.Unit, limitValues.Step, "STEP VALUE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "NULL", "", "", "NULL VALUE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "COMP", "", well.Operator, "COMPANY NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "WELL", "", well.Name, "WELL NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "FLD", "", well.Field, "FIELD NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "SRVC", "", logObject.ServiceCompany, "SERVICE COMPANY NAME", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "DATE", "", $"{DateTime.Now.ToShortDateString()} {DateTime.Now.ToShortTimeString()}", "DATE", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "CTRY", "", well.Country, "COUNTRY", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "UWI", "", well.Uid, "UNIQUE WELL IDENTIFIER", maxColumnLength, maxDataLenght);
        WriteWellParameter(writer, "LIC", "", well.NumLicense, "ERCB LICENCE NUMBER", maxColumnLength, maxDataLenght);
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
        if (data == null)
        {
            line.Append(new string(' ', maxDataLength));
        }
        else if (maxDataLength - data.Length > 0)
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
                        : CommonConstants.DepthIndex.NullValue.ToString(CultureInfo.InvariantCulture);

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
