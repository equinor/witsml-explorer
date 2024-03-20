using System.Collections.Generic;
using System.Text.Json;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Extensions;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Extensions
{
    public class WitsmlLogExtensionsTests
    {
        [Fact]
        public void EnsureIndexCurveIsFirst_IndexCurveIsNotFirst_MovesIndexCurveFirst()
        {
            WitsmlLog log = new WitsmlLog()
            {
                Uid = "uid",
                UidWell = "wellUid",
                UidWellbore = "wellboreUid",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                IndexCurve = new WitsmlIndexCurve() { Value = "IndexCurve" },
                LogCurveInfo = new()
                {
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve3",
                        Unit = "Unit1",
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve2",
                        Unit = "Unit2",
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "IndexCurve",
                        Unit = CommonConstants.Unit.Meter,
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve1",
                        Unit = CommonConstants.Unit.Meter,
                    },
                }
            };

            log.EnsureIndexCurveIsFirst();
            List<WitsmlLogCurveInfo> resultLCI = log.LogCurveInfo;

            Assert.Equal("IndexCurve", resultLCI[0].Mnemonic);
            Assert.Equal("Curve3", resultLCI[1].Mnemonic);
            Assert.Equal("Curve2", resultLCI[2].Mnemonic);
            Assert.Equal("Curve1", resultLCI[3].Mnemonic);
        }

        [Fact]
        public void EnsureIndexCurveIsFirst_CorrectLCI_StaysUnchanged()
        {
            WitsmlLog log = new WitsmlLog()
            {
                Uid = "uid",
                UidWell = "wellUid",
                UidWellbore = "wellboreUid",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                IndexCurve = new WitsmlIndexCurve() { Value = "IndexCurve" },
                LogCurveInfo = new()
                {
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "IndexCurve",
                        Unit = CommonConstants.Unit.Meter,
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve3",
                        Unit = "Unit1",
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve1",
                        Unit = "Unit2",
                    },
                    new WitsmlLogCurveInfo
                    {
                        Mnemonic = "Curve2",
                        Unit = CommonConstants.Unit.Meter,
                    },
                }
            };

            var originalLog = JsonSerializer.Serialize(log, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            log.EnsureIndexCurveIsFirst();

            var newLog = JsonSerializer.Serialize(log, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            Assert.Equal(originalLog, newLog);
        }
    }
}
