using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Query;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Services
{
    public class LogDataReader
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly string _uidWell;
        private readonly string _uidWellbore;
        private readonly string _uidLog;
        private readonly string _indexType;
        private readonly IEnumerable<string> _mnemonics;
        private Index _startIndex;
        private readonly Index _endIndex;
        private bool _dropFirstRow;
        private readonly BufferBlock<WitsmlLogData> _buffer;
        private Exception _exception;

        public string StartIndex => _startIndex.GetValueAsString();
        private bool _finished;

        /// <summary>
        /// Initializes a LogDataReader that will fetch all data as specified by the <paramref name="sourceLog"/> and <paramref name="mnemonics"/>.
        /// Fetching will start immediately on a separate thread and will buffer up to <paramref name="bufferSize"/> query results.
        /// </summary>
        /// <param name="witsmlClient">The witsmlClient used to fetch data</param>
        /// <param name="sourceLog">A WitsmlLog object used to retrieve well, wellbore, and log uids, and the start, end, type, and mnemonic of the index curve.</param>
        /// <param name="mnemonics">A list of mnemonics to fetch. The index curve will be added to this list if not present.</param>
        /// <param name="logger">A logger or null</param>
        /// <param name="bufferSize">How many query results to buffer at a time. Defaults to 4.</param>
        public LogDataReader(IWitsmlClient witsmlClient, WitsmlLog sourceLog, List<string> mnemonics, ILogger logger, int bufferSize = 4)
        {
            _witsmlClient = witsmlClient ?? throw new ArgumentNullException(nameof(witsmlClient));
            _uidWell = sourceLog?.UidWell ?? throw new ArgumentNullException(nameof(sourceLog));
            _uidWellbore = sourceLog.UidWellbore;
            _uidLog = sourceLog.Uid;
            _indexType = sourceLog.IndexType;
            _buffer = new BufferBlock<WitsmlLogData>(new DataflowBlockOptions() { BoundedCapacity = bufferSize });

            _startIndex = Index.Start(sourceLog);
            _endIndex = Index.End(sourceLog);
            _mnemonics = mnemonics ?? throw new ArgumentNullException(nameof(mnemonics));
            if (!mnemonics.Any())
            {
                _finished = true;
                logger?.LogInformation("{ClassName} received an empty mnemonics list. No data will be fetched", GetType().Name);
                return;
            }

            string indexMnemonic = sourceLog.IndexCurve.Value;
            if (!mnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
            {
                mnemonics.Insert(0, indexMnemonic);
            }
            Task.Run(Produce);
        }

        private async Task Produce()
        {
            try
            {
                while (true)
                {
                    WitsmlLogData logData = await FetchNextBatch();
                    if (logData == null)
                    {
                        break;
                    }
                    await WithTimeout(_buffer.SendAsync(logData));
                }
            }
            catch (Exception e)
            {
                _exception = e;
            }
            _finished = true;
        }

        private async Task<WitsmlLogData> FetchNextBatch()
        {
            WitsmlLogs query = LogQueries.GetLogContent(_uidWell, _uidWellbore, _uidLog, _indexType, _mnemonics, _startIndex, _endIndex);
            WitsmlLogs sourceData = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
            if (!sourceData.Logs.Any() || sourceData.Logs.First().LogData == null || !sourceData.Logs.First().LogData.Data.Any())
            {
                return null;
            }

            WitsmlLog sourceLogWithData = sourceData.Logs.First();
            WitsmlLogData sourceLogData = sourceLogWithData.LogData;
            if (_dropFirstRow)
            {
                sourceLogData.Data.RemoveAt(0);
                if (!sourceLogData.Data.Any())
                {
                    return null;
                }
            }

            string index = sourceLogData.Data.Last().Data.Split(",")[0];
            _startIndex = _indexType == WitsmlLog.WITSML_INDEX_TYPE_MD
            ? new DepthIndex(double.Parse(index, CultureInfo.InvariantCulture), ((DepthIndex)_endIndex).Uom)
            : new DateTimeIndex(DateTime.Parse(index));

            _dropFirstRow = true;
            return sourceLogData;
        }

        /// <summary>
        /// Fetches and returns the next batch of log data. Will throw if an exception has happened during fetching, or on timeout.
        /// </summary>
        /// <returns>WitsmlLogData or, if there is no more data to fetch, null</returns>
        public async Task<WitsmlLogData> GetNextBatch()
        {
            if (_exception != null)
            {
                throw _exception;
            }
            if (_finished && _buffer.Count == 0)
            {
                return null;
            }
            return await WithTimeout(_buffer.ReceiveAsync());
        }

        private async Task<T> WithTimeout<T>(Task<T> task)
        {
            const int timeoutMinutes = 5;
            if (await Task.WhenAny(task, Task.Delay(TimeSpan.FromMinutes(timeoutMinutes))) == task)
            {
                return await task;
            }
            else
            {
                throw new TimeoutException($"{GetType().Name} timed out after {timeoutMinutes} minutes");
            }
        }
    }
}
