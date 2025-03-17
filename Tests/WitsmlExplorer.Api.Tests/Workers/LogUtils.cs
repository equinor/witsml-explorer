using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class LogUtils
    {
        public const string WellUid = "wellUid";
        public const string WellboreUid = "wellboreUid";
        public const string SourceLogUid = "sourceLogUid";
        public const string TargetLogUid = "targetLogUid";

        public static readonly Dictionary<string, string[]> SourceMnemonics = new()
        {
            { WitsmlLog.WITSML_INDEX_TYPE_MD, new[] { "Depth", "DepthBit", "DepthHole" } },
            { WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] { "Time", "DepthBit", "DepthHole" } }
        };

        public const string TimeStart = "2019-11-01T21:01:00.000Z";
        public const string TimeEnd = "2019-11-01T21:05:00.000Z";

        public const double DepthStart = 1;
        public const double DepthEnd = 5;

        public static void SetupSourceLog(string indexType, Mock<IWitsmlClient> witsmlSourceClient, WitsmlLogs sourceLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlSourceClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlSourceClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == SourceLogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                        .ReturnsAsync(sourceLogs ?? GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, TimeStart, TimeEnd));
                    break;
                default:
                    break;
            }
        }

        public static void SetupTargetLog(string indexType, Mock<IWitsmlClient> witsmlTargetClient, WitsmlLogs targetLogs = null)
        {
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlTargetClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_MD));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlTargetClient.Setup(client =>
                            client.GetFromStoreAsync(It.Is<WitsmlLogs>(witsmlLogs => witsmlLogs.Logs.First().Uid == TargetLogUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null))
                        .ReturnsAsync(targetLogs ?? GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME));
                    break;
                default:
                    break;
            }
        }

        public static List<WitsmlLogs> SetupUpdateInStoreAsync(Mock<IWitsmlClient> witsmlClient)
        {
            List<WitsmlLogs> updatedLogs = new();
            witsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>())).Callback<WitsmlLogs>(updatedLogs.Add)
                .ReturnsAsync(new QueryResult(true));
            return updatedLogs;
        }

        public static void SetupGetDepthIndexed(Mock<IWitsmlClient> witsmlClient, WitsmlLogs query = null)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query!.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogData(startIndex, endIndex);
                });
        }

        public static void SetupGetDepthIndexedDecreasing(Mock<IWitsmlClient> witsmlClient, WitsmlLogs query = null)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query!.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return GetSourceLogDataDecreasing(startIndex, endIndex);
                });
        }

        public static CopyLogDataJob CreateJobTemplate(string startIndex = null, string endIndex = null)
        {
            return new CopyLogDataJob
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = SourceLogUid
                    }
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetLogUid
                },
                StartIndex = startIndex,
                EndIndex = endIndex
            };
        }

        public static WitsmlLogs GetSourceLogs(string indexType, string startDateTimeIndex, string endDateTimeIndex)
        {
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
                StartDateTimeIndex = startDateTimeIndex,
                EndDateTimeIndex = endDateTimeIndex,
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic,
                    MinDateTimeIndex = startDateTimeIndex,
                    MaxDateTimeIndex = endDateTimeIndex
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        public static WitsmlLogs GetSourceLogs(string indexType, double startIndex, double endIndex, string indexCurveValue = null)
        {
            WitsmlIndex minIndex = new(new DepthIndex(startIndex));
            WitsmlIndex maxIndex = new(new DepthIndex(endIndex));
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = indexCurveValue ?? SourceMnemonics[indexType][0] },
                StartIndex = minIndex,
                EndIndex = maxIndex,
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic.Equals(indexCurveValue, StringComparison.OrdinalIgnoreCase) ? indexCurveValue : mnemonic,
                    MinIndex = minIndex,
                    MaxIndex = maxIndex
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        public static WitsmlLogs GetSourceLogsDecreasing(string indexType, double startIndex, double endIndex, string indexCurveValue = null)
        {
            WitsmlIndex witsmlStartIndex = new(new DepthIndex(startIndex));
            WitsmlIndex witsmlEndIndex = new(new DepthIndex(endIndex));
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = indexCurveValue ?? SourceMnemonics[indexType][0] },
                Direction = WitsmlLog.WITSML_DIRECTION_DECREASING,
                StartIndex = witsmlStartIndex,
                EndIndex = witsmlEndIndex,
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic.Equals(indexCurveValue, StringComparison.OrdinalIgnoreCase) ? indexCurveValue : mnemonic,
                    MinIndex = witsmlStartIndex,
                    MaxIndex = witsmlEndIndex
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        public static WitsmlLogs GetSourceLogsEmpty(string indexType, string indexCurveValue = null)
        {
            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = indexCurveValue ?? SourceMnemonics[indexType][0] },
                LogCurveInfo = SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                {
                    Uid = mnemonic,
                    Mnemonic = mnemonic.Equals(indexCurveValue, StringComparison.OrdinalIgnoreCase) ? indexCurveValue : mnemonic
                }).ToList()
            };

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        public static WitsmlLogs GetTargetLogs(string indexType)
        {
            WitsmlLogCurveInfo indexLogCurveInfo = indexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => new WitsmlLogCurveInfo
                {
                    Uid = "Depth",
                    Mnemonic = "Depth",
                    MinIndex = new WitsmlIndex(new DepthIndex(CommonConstants.DepthIndex.NullValue)),
                    MaxIndex = new WitsmlIndex(new DepthIndex(CommonConstants.DepthIndex.NullValue))
                },
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new WitsmlLogCurveInfo
                {
                    Uid = "Time",
                    Mnemonic = "Time",
                    MinDateTimeIndex = CommonConstants.DateTimeIndex.NullValue,
                    MaxDateTimeIndex = CommonConstants.DateTimeIndex.NullValue
                },
                _ => null
            };

            WitsmlLog witsmlLog = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetLogUid,
                IndexType = indexType,
                IndexCurve = new WitsmlIndexCurve { Value = SourceMnemonics[indexType][0] },
                LogCurveInfo = new List<WitsmlLogCurveInfo> { indexLogCurveInfo }
            };
            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    witsmlLog.StartIndex = new WitsmlIndex(new DepthIndex(CommonConstants.DepthIndex.NullValue));
                    witsmlLog.EndIndex = new WitsmlIndex(new DepthIndex(CommonConstants.DepthIndex.NullValue));
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    witsmlLog.StartDateTimeIndex = CommonConstants.DateTimeIndex.NullValue;
                    witsmlLog.EndDateTimeIndex = CommonConstants.DateTimeIndex.NullValue;
                    break;
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { witsmlLog }
            };
        }

        public static WitsmlLogs GetSourceLogData(string startIndexValue, string endIndexValue)
        {
            DateTimeIndex startIndex = DateTimeIndex.FromString(startIndexValue);
            DateTimeIndex endIndex = DateTimeIndex.FromString(endIndexValue);
            DateTimeIndex currentIndex = DateTimeIndex.FromString(startIndexValue);

            List<WitsmlData> data = new();
            while (currentIndex <= endIndex)
            {
                data.Add(new WitsmlData { Data = $"{currentIndex.GetValueAsString()},1,1" });
                currentIndex = new DateTimeIndex(currentIndex.Value.AddMinutes(1));
            }

            if (data.Any())
            {
                return new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartDateTimeIndex = startIndex.GetValueAsString(),
                        EndDateTimeIndex = endIndex.GetValueAsString(),
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]),
                            UnitList = "datetime,m,m",
                            Data = data
                        }
                    }.AsItemInList()
                };
            }

            return new WitsmlLogs();
        }

        public static WitsmlLogs GetSourceLogData(double startIndexValue, double endIndexValue, IEnumerable<string> mnemonics = null)
        {
            DepthIndex startIndex = new(startIndexValue);
            DepthIndex endIndex = new(endIndexValue);
            DepthIndex currentIndex = new(startIndexValue);

            List<WitsmlData> data = new();
            if (startIndex < endIndex)
            {
                while (currentIndex <= endIndex)
                {
                    data.Add(new WitsmlData { Data = $"{currentIndex.Value},1,1" });
                    currentIndex = new DepthIndex(currentIndex.Value + 1);
                }
            }

            if (data.Any())
            {
                return new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartIndex = new WitsmlIndex(new DepthIndex(startIndex.Value)),
                        EndIndex = new WitsmlIndex(new DepthIndex(endIndex.Value)),
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", mnemonics ?? SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]),
                            UnitList = "m,m,m",
                            Data = data
                        }
                    }.AsItemInList()
                };
            }

            return new WitsmlLogs();
        }

        public static WitsmlLogs GetSourceLogDataDecreasing(double startIndexValue, double endIndexValue, IEnumerable<string> mnemonics = null)
        {
            DepthIndex startIndex = new(startIndexValue);
            DepthIndex endIndex = new(endIndexValue);
            DepthIndex currentIndex = new(startIndexValue);

            List<WitsmlData> data = new();
            if (startIndex > endIndex)
            {
                while (currentIndex >= endIndex)
                {
                    data.Add(new WitsmlData { Data = $"{currentIndex.Value},1,1" });
                    currentIndex = new DepthIndex(currentIndex.Value - 1);
                }
            }

            if (data.Any())
            {
                return new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartIndex = new WitsmlIndex(new DepthIndex(startIndex.Value)),
                        EndIndex = new WitsmlIndex(new DepthIndex(endIndex.Value)),
                        Direction = WitsmlLog.WITSML_DIRECTION_DECREASING,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", mnemonics ?? SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]),
                            UnitList = "m,m,m",
                            Data = data
                        }
                    }.AsItemInList()
                };
            }

            return new WitsmlLogs();
        }

        public static void SetupGetDepthIndexed(Mock<IWitsmlClient> witsmlClient, Func<WitsmlLogs, bool> predicate, List<WitsmlData> data)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.Is<WitsmlLogs>(logs => predicate(logs)), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .ReturnsAsync(() => new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartIndex = new WitsmlIndex(new DepthIndex(StringHelpers.ToDouble(data.First().Data.Split(CommonConstants.DataSeparator)[0]))),
                        EndIndex = new WitsmlIndex(new DepthIndex(StringHelpers.ToDouble(data.Last().Data.Split(CommonConstants.DataSeparator)[0]))),
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]),
                            UnitList = "m,m,m",
                            Data = new(data)
                        }
                    }.AsItemInList()
                });
        }

        public static void SetUpGetServerCapabilites(Mock<IWitsmlClient> witsmlClient)
        {
            var serverCapabalities = new WitsmlCapServers()
            {
                ServerCapabilities = new List<WitsmlServerCapabilities>()
                {
                    new WitsmlServerCapabilities()
                    {
                        Functions = new List<WitsmlFunction>()
                        {
                            new WitsmlFunction()
                            {
                                DataObjects = new List<WitsmlFunctionDataObject>()
                                {
                                    new WitsmlFunctionDataObject()
                                    {
                                        MaxDataNodes = 10000,
                                        MaxDataPoints = 8000000,
                                        Name = "log"
                                    }
                                },
                                Name = "WMLS_UpdateInStore"
                            }
                        }
                    }
                }

            };
            witsmlClient.Setup(client => client.GetCap()).ReturnsAsync(serverCapabalities);
        }
    }
}
