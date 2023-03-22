using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

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

        public string StartIndex => _startIndex.GetValueAsString();
        private bool _finished;

        /// <summary>
        /// Initializes a LogDataReader that will fetch all data as specified by the <paramref name="sourceLog"/> and <paramref name="mnemonics"/>.
        /// </summary>
        /// <param name="witsmlClient">The witsmlClient used to fetch data</param>
        /// <param name="sourceLog">A WitsmlLog object used to retrieve well, wellbore, and log uids, and the start, end, type, and mnemonic of the index curve.</param>
        /// <param name="mnemonics">A list of mnemonics to fetch. The index curve will be added to this list if not present.</param>
        /// <param name="logger">A logger or null</param>
        public LogDataReader(IWitsmlClient witsmlClient, WitsmlLog sourceLog, List<string> mnemonics, ILogger logger)
        {
            _witsmlClient = witsmlClient;
            _uidWell = sourceLog.UidWell;
            _uidWellbore = sourceLog.UidWellbore;
            _uidLog = sourceLog.Uid;
            _indexType = sourceLog.IndexType;

            _startIndex = Index.Start(sourceLog);
            _endIndex = Index.End(sourceLog);
            _mnemonics = mnemonics;
            if (!mnemonics.Any())
            {
                _finished = true;
                logger?.LogInformation("{ClassName} received an empty mnemonics list. No data will be fetched", GetType().Name);
            }
            else
            {
                string indexMnemonic = sourceLog.IndexCurve.Value;
                if (!mnemonics.Contains(indexMnemonic, StringComparer.InvariantCultureIgnoreCase))
                {
                    mnemonics.Insert(0, indexMnemonic);
                }
            }
        }

        /// <summary>
        /// Fetches and returns the next batch of log data.
        /// </summary>
        /// <returns>WitsmlLogData or, if there is no more data to fetch, null</returns>
        public async Task<WitsmlLogData> GetNextBatch()
        {
            if (_finished)
            {
                return null;
            }
            WitsmlLogs query = LogQueries.GetLogContent(_uidWell, _uidWellbore, _uidLog, _indexType, _mnemonics, _startIndex, _endIndex);
            WitsmlLogs sourceData = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.DataOnly));
            if (!sourceData.Logs.Any() || sourceData.Logs.First().LogData == null || !sourceData.Logs.First().LogData.Data.Any())
            {
                _finished = true;
                return null;
            }

            WitsmlLog sourceLogWithData = sourceData.Logs.First();
            WitsmlLogData sourceLogData = sourceLogWithData.LogData;
            if (_dropFirstRow)
            {
                sourceLogData.Data.RemoveAt(0);
                if (!sourceLogData.Data.Any())
                {
                    _finished = true;
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
    }
}
