using System;
using System.Collections.Generic;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers.DeepComparison;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class DeepObjectComparerTests
    {
        private readonly DeepObjectComparer _comparer = new();

        [Fact]
        public void Compare_TrajectoryStationsOutOfOrder_SortsAndMatches()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new() { Uid = "st2", Md = new WitsmlMeasuredDepthCoord { Value = "200", Uom = "m" }, TypeTrajStation = "tie in" },
                    new() { Uid = "st1", Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m" }, TypeTrajStation = "azimuth" }
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new() { Uid = "st1", Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m" }, TypeTrajStation = "azimuth" },
                    new() { Uid = "st2", Md = new WitsmlMeasuredDepthCoord { Value = "200", Uom = "m" }, TypeTrajStation = "tie in" }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareObjects(EntityType.Trajectory, source, target, options);

            Assert.Empty(diffs);
        }

        [Fact]
        public void Compare_TubularComponentsOutOfOrder_SortsBySequenceAndMatches()
        {
            var source = new WitsmlTubular
            {
                Uid = "tub1",
                Name = "Tubular 1",
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new() { Uid = "tc2", Sequence = 2, TypeTubularComp = "drill collar" },
                    new() { Uid = "tc1", Sequence = 1, TypeTubularComp = "bit" }
                }
            };

            var target = new WitsmlTubular
            {
                Uid = "tub1",
                Name = "Tubular 1",
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new() { Uid = "tc1", Sequence = 1, TypeTubularComp = "bit" },
                    new() { Uid = "tc2", Sequence = 2, TypeTubularComp = "drill collar" }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareObjects(EntityType.Tubular, source, target, options);

            Assert.Empty(diffs);
        }

        [Fact]
        public void Compare_OmitCustomData_IgnoresDifferencesInCustomData()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                CustomData = new WitsmlCustomData { Verbatim = "<tag>ServerA</tag>" }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                CustomData = new WitsmlCustomData { Verbatim = "<tag>ServerB</tag>" }
            };

            var optionsWithOmit = new DeepComparisonOptions { OmitCustomData = true };
            var diffsWithOmit = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsWithOmit);
            Assert.Empty(diffsWithOmit);

            var optionsWithoutOmit = new DeepComparisonOptions { OmitCustomData = false };
            var diffsWithoutOmit = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsWithoutOmit);
            Assert.NotEmpty(diffsWithoutOmit);
        }

        [Fact]
        public void Compare_OmitTimestamps_IgnoresDifferencesInAuditTimestamps()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                CommonData = new WitsmlCommonData
                {
                    DTimCreation = "2023-01-01T00:00:00.000Z",
                    DTimLastChange = "2023-01-02T00:00:00.000Z"
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                CommonData = new WitsmlCommonData
                {
                    DTimCreation = "2023-06-01T12:00:00.000Z",
                    DTimLastChange = "2023-06-02T12:00:00.000Z"
                }
            };

            var optionsWithOmit = new DeepComparisonOptions { OmitTimestamps = true };
            var diffsWithOmit = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsWithOmit);
            Assert.Empty(diffsWithOmit);

            var optionsWithoutOmit = new DeepComparisonOptions { OmitTimestamps = false };
            var diffsWithoutOmit = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsWithoutOmit);
            Assert.Equal(2, diffsWithoutOmit.Count);
        }

        [Fact]
        public void Compare_TimezoneNormalization_MatchesEquivalentDateTimesInDifferentOffsets()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                DTimTrajStart = "2023-01-01T10:00:00Z"
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                DTimTrajStart = "2023-01-01T12:00:00+02:00" // Identical instant in time
            };

            var optionsUtc = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var diffsUtc = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsUtc);
            Assert.Empty(diffsUtc);

            var optionsRaw = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Raw };
            var diffsRaw = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsRaw);
            Assert.Single(diffsRaw);
        }

        [Fact]
        public void Compare_TrajectoryStationDTimStn_NormalizesReportValuesToUtcWhenConfigured()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m" },
                        DTimStn = "2026-11-01T03:06:23.000Z"
                    },
                    new()
                    {
                        Uid = "st2",
                        Md = new WitsmlMeasuredDepthCoord { Value = "200", Uom = "m" },
                        DTimStn = "2026-11-01T03:06:23.767Z"
                    }
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m" },
                        DTimStn = "2026-11-01T04:06:23.000+01:00" // Same UTC instant as st1 on source
                    },
                    new()
                    {
                        Uid = "st2",
                        Md = new WitsmlMeasuredDepthCoord { Value = "200", Uom = "m" },
                        DTimStn = "2026-11-01T04:06:23.000+01:00" // Differs by 767ms from st2 on source; should be reported in UTC
                    }
                }
            };

            var optionsUtc = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var diffsUtc = _comparer.CompareObjects(EntityType.Trajectory, source, target, optionsUtc);

            Assert.Single(diffsUtc);
            Assert.Equal("Trajectory.TrajectoryStations[Uid=st2].DTimStn", diffsUtc[0].PropertyPath);
            Assert.Equal("2026-11-01T03:06:23.767Z", diffsUtc[0].SourceValue);
            Assert.Equal("2026-11-01T03:06:23.000Z", diffsUtc[0].TargetValue);
        }

        [Fact]
        public void Compare_Trajectory_CoversAllWitsml1411SchemaElementsAndAttributes()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                MdMin = new WitsmlMeasuredDepthCoord { Value = "0", Uom = "m", Datum = "KB" },
                MdMax = new WitsmlMeasuredDepthCoord { Value = "1000", Uom = "m", Datum = "KB" },
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m", Datum = "KB" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "95", Uom = "m", Datum = "MSL" },
                        ExtensionNameValues = new List<WitsmlExtensionNameValue>
                        {
                            new()
                            {
                                Uid = "ext1",
                                Name = "StationExt",
                                Value = new WitsmlExtensionValue { Value = "10", Uom = "m" },
                                Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m", Datum = "KB" }
                            }
                        },
                        CommonData = new WitsmlCommonData
                        {
                            AcquisitionTimeZoneObject = new WitsmlTimestampedTimeZone { DTim = "2026-11-01T03:00:00Z", Value = "+01:00" },
                            DefaultDatumRef = new WitsmlRefNameString { UidRef = "KB", Value = "Kelly Bushing" }
                        }
                    }
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                MdMin = new WitsmlMeasuredDepthCoord { Value = "0", Uom = "m", Datum = "MSL" },
                MdMax = new WitsmlMeasuredDepthCoord { Value = "1000", Uom = "m", Datum = "KB" },
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m", Datum = "MSL" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "95", Uom = "m", Datum = "KB" },
                        ExtensionNameValues = new List<WitsmlExtensionNameValue>
                        {
                            new()
                            {
                                Uid = "ext1",
                                Name = "StationExt",
                                Value = new WitsmlExtensionValue { Value = "20", Uom = "m" },
                                Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m", Datum = "MSL" }
                            }
                        },
                        CommonData = new WitsmlCommonData
                        {
                            AcquisitionTimeZoneObject = new WitsmlTimestampedTimeZone { DTim = "2026-11-02T03:00:00Z", Value = "+01:00" },
                            DefaultDatumRef = new WitsmlRefNameString { UidRef = "MSL", Value = "Kelly Bushing" }
                        }
                    }
                }
            };

            var options = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var diffs = _comparer.CompareObjects(EntityType.Trajectory, source, target, options);

            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.MdMin.Datum" && d.SourceValue == "KB" && d.TargetValue == "MSL");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].Md.Datum" && d.SourceValue == "KB" && d.TargetValue == "MSL");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].Tvd.Datum" && d.SourceValue == "MSL" && d.TargetValue == "KB");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].ExtensionNameValues[Uid=ext1].Value.Value" && d.SourceValue == "10" && d.TargetValue == "20");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].ExtensionNameValues[Uid=ext1].Md.Datum" && d.SourceValue == "KB" && d.TargetValue == "MSL");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].CommonData.AcquisitionTimeZone.DTim" && d.SourceValue == "2026-11-01T03:00:00.000Z" && d.TargetValue == "2026-11-02T03:00:00.000Z");
            Assert.Contains(diffs, d => d.PropertyPath == "Trajectory.TrajectoryStations[Uid=st1].CommonData.DefaultDatum.UidRef" && d.SourceValue == "KB" && d.TargetValue == "MSL");
        }

        [Fact]
        public void Compare_DecimalTolerance_MatchesWithinTolerance()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100.1234", Uom = "m" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "90.0001", Uom = "m" }
                    }
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100.1238", Uom = "m" }, // Differs at 4th decimal place
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "90.0003", Uom = "m" }
                    }
                }
            };

            // 2 decimal places: 100.12 == 100.12
            var options2Decimals = new DeepComparisonOptions { DecimalPlaces = 2 };
            var diffs2 = _comparer.CompareObjects(EntityType.Trajectory, source, target, options2Decimals);
            Assert.Empty(diffs2);

            // 4 decimal places: 100.1234 != 100.1238
            var options4Decimals = new DeepComparisonOptions { DecimalPlaces = 4 };
            var diffs4 = _comparer.CompareObjects(EntityType.Trajectory, source, target, options4Decimals);
            Assert.Equal(2, diffs4.Count);
        }


        [Fact]
        public void Compare_DecimalRaw_ComparesWithoutAdjustment()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100.1234", Uom = "m" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "90.0001", Uom = "m" }
                    }
                }
            };

            var targetDiff = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100.1238", Uom = "m" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "90.0003", Uom = "m" }
                    }
                }
            };

            var targetSame = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new()
                    {
                        Uid = "st1",
                        Md = new WitsmlMeasuredDepthCoord { Value = "100.12340", Uom = "m" },
                        Tvd = new WitsmlWellVerticalDepthCoord { Value = "90.0001", Uom = "m" }
                    }
                }
            };

            var optionsRaw = new DeepComparisonOptions { DecimalMode = DecimalComparisonMode.Raw };
            var diffs = _comparer.CompareObjects(EntityType.Trajectory, source, targetDiff, optionsRaw);
            Assert.Equal(2, diffs.Count);

            var diffsSame = _comparer.CompareObjects(EntityType.Trajectory, source, targetSame, optionsRaw);
            Assert.Empty(diffsSame);
        }

        [Fact]
        public void Compare_MudLogGeologyIntervalsOutOfOrder_SortsByMdTopAndMatches()
        {
            var source = new WitsmlMudLog
            {
                Uid = "ml1",
                Name = "MudLog 1",
                GeologyInterval = new List<WitsmlMudLogGeologyInterval>
                {
                    new() { Uid = "gi2", MdTop = new WitsmlMeasureWithDatum { Value = "500", Uom = "m" }, TypeLithology = "sandstone" },
                    new() { Uid = "gi1", MdTop = new WitsmlMeasureWithDatum { Value = "250", Uom = "m" }, TypeLithology = "shale" }
                }
            };

            var target = new WitsmlMudLog
            {
                Uid = "ml1",
                Name = "MudLog 1",
                GeologyInterval = new List<WitsmlMudLogGeologyInterval>
                {
                    new() { Uid = "gi1", MdTop = new WitsmlMeasureWithDatum { Value = "250", Uom = "m" }, TypeLithology = "shale" },
                    new() { Uid = "gi2", MdTop = new WitsmlMeasureWithDatum { Value = "500", Uom = "m" }, TypeLithology = "sandstone" }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareObjects(EntityType.MudLog, source, target, options);
            Assert.Empty(diffs);
        }

        [Fact]
        public void Compare_MeasureUnitMismatch_ClassifiedAsUnitMismatch()
        {
            var source = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new() { Uid = "st1", Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "m" }, TypeTrajStation = "tie in" }
                }
            };

            var target = new WitsmlTrajectory
            {
                Uid = "traj1",
                Name = "Traj 1",
                TrajectoryStations = new List<WitsmlTrajectoryStation>
                {
                    new() { Uid = "st1", Md = new WitsmlMeasuredDepthCoord { Value = "100", Uom = "ft" }, TypeTrajStation = "tie in" }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareObjects(EntityType.Trajectory, source, target, options);

            Assert.Single(diffs);
            Assert.Equal("UnitMismatch", diffs[0].DifferenceType);
            Assert.Equal("100 m", diffs[0].SourceValue);
            Assert.Equal("100 ft", diffs[0].TargetValue);
            Assert.Contains("Unit mismatch", diffs[0].Description);
        }

        [Fact]
        public void Compare_LogCurveInfo_DetectsMetadataDifferences()
        {
            var sourceCurve = new WitsmlLogCurveInfo
            {
                Uid = "GR_uid1",
                Mnemonic = "GR",
                ClassWitsml = "gamma ray",
                ClassIndex = "measured depth",
                Unit = "gAPI",
                MnemAlias = "GR_ALIAS",
                NullValue = "-999.25",
                AlternateIndex = "false",
                WellDatum = "KB",
                CurveDescription = "Gamma Ray Log",
                SensorOffset = new WitsmlLengthMeasure { Value = "12.5", Uom = "m" },
                DataSource = "Realtime telemetry",
                DensData = new WitsmlPerLengthMeasure { Value = "10", Uom = "1/m" },
                TraceState = "raw",
                TraceOrigin = "realtime",
                TypeLogData = "double",
                AxisDefinitions = new List<WitsmlAxisDefinition>
                {
                    new() { Order = 1, Count = 10, Name = "axis1", Uom = "m" }
                },
                ExtensionNameValues = new List<WitsmlExtensionNameValue>
                {
                    new() { Name = "ToolVendor", Value = new WitsmlExtensionValue { Value = "VendorA" } }
                }
            };

            var targetCurve = new WitsmlLogCurveInfo
            {
                Uid = "GR_uid2",
                Mnemonic = "GR",
                ClassWitsml = "density",
                ClassIndex = "measured depth",
                Unit = "gAPI",
                MnemAlias = "GR_ALIAS_DIFF",
                NullValue = "-9999",
                AlternateIndex = "true",
                WellDatum = "DF",
                CurveDescription = "Corrected Gamma Ray",
                SensorOffset = new WitsmlLengthMeasure { Value = "15.0", Uom = "m" },
                DataSource = "Memory playback",
                DensData = new WitsmlPerLengthMeasure { Value = "10", Uom = "1/m" },
                TraceState = "processed",
                TraceOrigin = "memory",
                TypeLogData = "double",
                AxisDefinitions = new List<WitsmlAxisDefinition>
                {
                    new() { Order = 1, Count = 20, Name = "axis1", Uom = "m" }
                },
                ExtensionNameValues = new List<WitsmlExtensionNameValue>
                {
                    new() { Name = "ToolVendor", Value = new WitsmlExtensionValue { Value = "VendorB" } }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareLogCurveInfo("measured depth", "log1", "Log 1", sourceCurve, targetCurve, options);

            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].ClassWitsml" && d.SourceValue == "gamma ray" && d.TargetValue == "density");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].NullValue" && d.SourceValue == "-999.25" && d.TargetValue == "-9999");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].MnemAlias" && d.SourceValue == "GR_ALIAS" && d.TargetValue == "GR_ALIAS_DIFF");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].AlternateIndex" && d.SourceValue == "false" && d.TargetValue == "true");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].WellDatum" && d.SourceValue == "KB" && d.TargetValue == "DF");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].CurveDescription" && d.SourceValue == "Gamma Ray Log" && d.TargetValue == "Corrected Gamma Ray");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].SensorOffset" && d.DifferenceType == "MeasureMismatch");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].DataSource" && d.SourceValue == "Realtime telemetry" && d.TargetValue == "Memory playback");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].TraceState" && d.SourceValue == "raw" && d.TargetValue == "processed");
            Assert.Contains(diffs, d => d.PropertyPath == "LogCurve[GR].TraceOrigin" && d.SourceValue == "realtime" && d.TargetValue == "memory");
            Assert.Contains(diffs, d => d.PropertyPath.StartsWith("LogCurve[GR].AxisDefinitions[Order=1].Count") && d.SourceValue == "10" && d.TargetValue == "20");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("ToolVendor") && d.SourceValue == "VendorA" && d.TargetValue == "VendorB");

            Assert.DoesNotContain(diffs, d => d.PropertyPath == "LogCurve[GR].ClassIndex");
            Assert.DoesNotContain(diffs, d => d.PropertyPath == "LogCurve[GR].TypeLogData");
            Assert.DoesNotContain(diffs, d => d.PropertyPath == "LogCurve[GR].DensData");
        }

        [Fact]
        public void Compare_Well_IdenticalWells_ReturnsNoDifferences()
        {
            var well = new WitsmlWell
            {
                Uid = "w-1",
                Name = "Well 1",
                Field = "North Sea",
                Country = "Norway",
                Operator = "Equinor",
                TimeZone = "+01:00",
                GroundElevation = new WitsmlMeasureWithDatum { Value = "25.5", Uom = "m", Datum = "MSL" },
                WaterDepth = new WitsmlLengthMeasure { Value = "120.0", Uom = "m" },
                WellDatum = new List<WitsmlWellDatum>
                {
                    new() { Uid = "KB", Name = "Kelly Bushing", Code = "KB", Elevation = new WitsmlMeasureWithDatum { Value = "35.2", Uom = "m", Datum = "MSL" } }
                },
                WellLocation = new List<WitsmlLocation>
                {
                    new() { Uid = "loc1", Latitude = new WitsmlPlaneAngleMeasure { Value = "60.123", Uom = "dega" }, Longitude = new WitsmlPlaneAngleMeasure { Value = "2.456", Uom = "dega" } }
                },
                WellCRS = new List<WitsmlWellCRS>
                {
                    new() { Uid = "crs1", Name = "ED50 / UTM Zone 31N" }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareWell(well, well, options);

            Assert.Empty(diffs);
        }

        [Fact]
        public void Compare_Well_DetectsDifferencesAcrossStandardElements()
        {
            var sourceWell = new WitsmlWell
            {
                Uid = "w-1",
                Name = "Well 1",
                Field = "Field A",
                Operator = "Operator A",
                Country = "Norway",
                TimeZone = "+01:00",
                DTimSpud = "2023-01-01T00:00:00Z",
                GroundElevation = new WitsmlMeasureWithDatum { Value = "25.5", Uom = "m", Datum = "MSL" },
                WaterDepth = new WitsmlLengthMeasure { Value = "120.0", Uom = "m" },
                WellDatum = new List<WitsmlWellDatum>
                {
                    new()
                    {
                        Uid = "KB",
                        Name = "Kelly Bushing",
                        Code = "KB",
                        Elevation = new WitsmlMeasureWithDatum { Value = "35.2", Uom = "m", Datum = "MSL" },
                        DatumName = new WitsmlDatumName { NamingSystem = "EPSG", Code = "5100", Value = "MSL" }
                    }
                },
                WellLocation = new List<WitsmlLocation>
                {
                    new()
                    {
                        Uid = "loc1",
                        Latitude = new WitsmlPlaneAngleMeasure { Value = "60.12345", Uom = "dega" },
                        Longitude = new WitsmlPlaneAngleMeasure { Value = "2.45678", Uom = "dega" }
                    }
                },
                WellCRS = new List<WitsmlWellCRS>
                {
                    new()
                    {
                        Uid = "crs1",
                        Name = "ED50 / UTM Zone 31N",
                        MapProjection = new WitsmlMapProjection
                        {
                            ProjectionCode = "UTM",
                            Parameters = new List<WitsmlProjectionParameter>
                            {
                                new() { Index = "1", Name = "Central Meridian", Value = "3.0" }
                            }
                        }
                    }
                }
            };

            var targetWell = new WitsmlWell
            {
                Uid = "w-1",
                Name = "Well 1",
                Field = "Field B",
                Operator = "Operator B",
                Country = "Norway",
                TimeZone = "+02:00",
                DTimSpud = "2023-01-02T00:00:00Z",
                GroundElevation = new WitsmlMeasureWithDatum { Value = "30.0", Uom = "m", Datum = "MSL" },
                WaterDepth = new WitsmlLengthMeasure { Value = "120.0", Uom = "ft" }, // Unit mismatch
                WellDatum = new List<WitsmlWellDatum>
                {
                    new()
                    {
                        Uid = "KB",
                        Name = "Kelly Bushing",
                        Code = "KB",
                        Elevation = new WitsmlMeasureWithDatum { Value = "40.0", Uom = "m", Datum = "MSL" },
                        DatumName = new WitsmlDatumName { NamingSystem = "EPSG", Code = "5714", Value = "MSL" }
                    }
                },
                WellLocation = new List<WitsmlLocation>
                {
                    new()
                    {
                        Uid = "loc1",
                        Latitude = new WitsmlPlaneAngleMeasure { Value = "60.99999", Uom = "dega" },
                        Longitude = new WitsmlPlaneAngleMeasure { Value = "2.45678", Uom = "dega" }
                    }
                },
                WellCRS = new List<WitsmlWellCRS>
                {
                    new()
                    {
                        Uid = "crs1",
                        Name = "WGS84 / UTM Zone 31N",
                        MapProjection = new WitsmlMapProjection
                        {
                            ProjectionCode = "UTM",
                            Parameters = new List<WitsmlProjectionParameter>
                            {
                                new() { Index = "1", Name = "Central Meridian", Value = "4.0" }
                            }
                        }
                    }
                }
            };

            var options = new DeepComparisonOptions();
            var diffs = _comparer.CompareWell(sourceWell, targetWell, options);

            Assert.Contains(diffs, d => d.PropertyPath == "Well.Field" && d.SourceValue == "Field A" && d.TargetValue == "Field B");
            Assert.Contains(diffs, d => d.PropertyPath == "Well.Operator" && d.SourceValue == "Operator A" && d.TargetValue == "Operator B");
            Assert.Contains(diffs, d => d.PropertyPath == "Well.TimeZone" && d.SourceValue == "+01:00" && d.TargetValue == "+02:00");
            Assert.Contains(diffs, d => d.PropertyPath == "Well.GroundElevation" && d.DifferenceType == "MeasureMismatch");
            Assert.Contains(diffs, d => d.PropertyPath == "Well.WaterDepth" && d.DifferenceType == "UnitMismatch");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("WellDatum[Uid=KB].Elevation") && d.DifferenceType == "MeasureMismatch");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("DatumName.Code") && d.SourceValue == "5100" && d.TargetValue == "5714");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("WellLocation[Uid=loc1].Latitude") && d.DifferenceType == "MeasureMismatch");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("WellCRS[Uid=crs1].Name") && d.SourceValue == "ED50 / UTM Zone 31N" && d.TargetValue == "WGS84 / UTM Zone 31N");
            Assert.Contains(diffs, d => d.PropertyPath.Contains("Parameters[Index=1].Value") && d.SourceValue == "3.0" && d.TargetValue == "4.0");

            Assert.DoesNotContain(diffs, d => d.PropertyPath.Contains("WellLocation[Uid=loc1].Longitude"));
        }

        [Fact]
        public void Compare_Wellbore_CoversAllWitsml1411ElementsAndNormalizesUtcTimestamps()
        {
            var sourceWellbore = new WitsmlWellbore
            {
                Uid = "wb-1",
                Name = "Wellbore 1",
                Number = "1",
                SuffixAPI = "01",
                NumGovt = "G-1",
                ParentWellbore = new WitsmlParentWellbore { UidRef = "wb-0", Value = "Main Wellbore" },
                StatusWellbore = "active",
                IsActive = "true",
                PurposeWellbore = "exploration",
                TypeWellbore = "initial",
                Shape = "deviated",
                DTimKickoff = "2026-11-01T04:00:00.500+01:00",
                AchievedTD = "true",
                Md = new WitsmlMeasuredDepthCoord { Value = "2500", Uom = "m", Datum = "KB" },
                Tvd = new WitsmlWellVerticalDepthCoord { Value = "2300", Uom = "m", Datum = "MSL" },
                MdBit = new WitsmlMeasuredDepthCoord { Value = "2450", Uom = "m", Datum = "KB" },
                TvdBit = new WitsmlWellVerticalDepthCoord { Value = "2260", Uom = "m", Datum = "MSL" },
                MdKickoff = new WitsmlMeasuredDepthCoord { Value = "500", Uom = "m", Datum = "KB" },
                TvdKickoff = new WitsmlWellVerticalDepthCoord { Value = "500", Uom = "m", Datum = "MSL" },
                DayTarget = new WitsmlDayMeasure { Value = "45", Uom = "d" },
                CommonData = new WitsmlCommonData
                {
                    SourceName = "SourceA",
                    AcquisitionTimeZoneObject = new WitsmlTimestampedTimeZone { DTim = "2026-11-01T03:00:00Z", Value = "+01:00" },
                    DefaultDatumRef = new WitsmlRefNameString { UidRef = "KB", Value = "Kelly Bushing" }
                }
            };

            var targetWellbore = new WitsmlWellbore
            {
                Uid = "wb-1",
                Name = "Wellbore 1",
                Number = "1",
                SuffixAPI = "01",
                NumGovt = "G-1",
                ParentWellbore = new WitsmlParentWellbore { UidRef = "wb-parent-diff", Value = "Main Wellbore" },
                StatusWellbore = "active",
                IsActive = "true",
                PurposeWellbore = "development",
                TypeWellbore = "initial",
                Shape = "deviated",
                DTimKickoff = "2026-11-01T04:00:00.000+01:00",
                AchievedTD = "false",
                Md = new WitsmlMeasuredDepthCoord { Value = "2500", Uom = "m", Datum = "KB" },
                Tvd = new WitsmlWellVerticalDepthCoord { Value = "2300", Uom = "m", Datum = "MSL" },
                MdBit = new WitsmlMeasuredDepthCoord { Value = "2450", Uom = "m", Datum = "MSL" },
                TvdBit = new WitsmlWellVerticalDepthCoord { Value = "2280", Uom = "m", Datum = "MSL" },
                MdKickoff = new WitsmlMeasuredDepthCoord { Value = "500", Uom = "m", Datum = "KB" },
                TvdKickoff = new WitsmlWellVerticalDepthCoord { Value = "500", Uom = "m", Datum = "MSL" },
                DayTarget = new WitsmlDayMeasure { Value = "45", Uom = "d" },
                CommonData = new WitsmlCommonData
                {
                    SourceName = "SourceA",
                    AcquisitionTimeZoneObject = new WitsmlTimestampedTimeZone { DTim = "2026-11-01T04:00:00+01:00", Value = "+01:00" }, // Same UTC instant
                    DefaultDatumRef = new WitsmlRefNameString { UidRef = "KB", Value = "Kelly Bushing" }
                }
            };

            var options = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var diffs = _comparer.CompareWellbore(sourceWellbore, targetWellbore, options);

            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.ParentWellbore.UidRef" && d.SourceValue == "wb-0" && d.TargetValue == "wb-parent-diff");
            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.PurposeWellbore" && d.SourceValue == "exploration" && d.TargetValue == "development");
            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.DTimKickoff" && d.SourceValue == "2026-11-01T03:00:00.500Z" && d.TargetValue == "2026-11-01T03:00:00.000Z");
            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.AchievedTD" && d.SourceValue == "true" && d.TargetValue == "false");
            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.MdBit.Datum" && d.SourceValue == "KB" && d.TargetValue == "MSL");
            Assert.Contains(diffs, d => d.PropertyPath == "Wellbore.TvdBit" && d.DifferenceType == "MeasureMismatch");
            Assert.DoesNotContain(diffs, d => d.PropertyPath.Contains("AcquisitionTimeZone"));
        }

        [Fact]
        public void Compare_LogHeaderAndCurveAttributes_CoversAllWitsml1411Elements()
        {
            var sourceLog = new WitsmlLog
            {
                Uid = "log-1",
                Name = "Depth Log",
                ObjectGrowing = "false",
                DataUpateRate = "5",
                CurveSensorsAligned = "true",
                DataGroup = "Drilling",
                ServiceCompany = "SLB",
                RunNumber = "1",
                BHARunNumber = "1",
                Pass = "1",
                CreationDate = "2026-11-01T04:06:23.500+01:00",
                Description = "Main Log",
                DataDelimiter = ",",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                StepIncrement = new WitsmlRatioGenericMeasure { Value = "0.5", Uom = "m", Numerator = "1", Denominator = "2" },
                IndexCurve = new WitsmlIndexCurve { ColumnIndex = "1", Value = "DEPT" },
                NullValue = "-999.25",
                LogParam = new List<WitsmlIndexedObject>
                {
                    new() { Index = "1", Name = "MudWeight", Uom = "sg", Value = "1.25", Description = "MW" }
                }
            };

            var targetLog = new WitsmlLog
            {
                Uid = "log-1",
                Name = "Depth Log",
                ObjectGrowing = "false",
                DataUpateRate = "10",
                CurveSensorsAligned = "false",
                DataGroup = "Drilling",
                ServiceCompany = "SLB",
                RunNumber = "1",
                BHARunNumber = "1",
                Pass = "1",
                CreationDate = "2026-11-01T04:06:23.000+01:00",
                Description = "Main Log",
                DataDelimiter = ";",
                IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                StepIncrement = new WitsmlRatioGenericMeasure { Value = "0.5", Uom = "m", Numerator = "1", Denominator = "4" },
                IndexCurve = new WitsmlIndexCurve { ColumnIndex = "1", Value = "DEPT" },
                NullValue = "-999.25",
                LogParam = new List<WitsmlIndexedObject>
                {
                    new() { Index = "1", Name = "MudWeight", Uom = "sg", Value = "1.30", Description = "MW" }
                }
            };

            var options = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var headerDiffs = _comparer.CompareLogHeader(sourceLog, targetLog, options);

            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.DataUpateRate" && d.SourceValue == "5" && d.TargetValue == "10");
            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.CurveSensorsAligned" && d.SourceValue == "true" && d.TargetValue == "false");
            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.CreationDate" && d.SourceValue == "2026-11-01T03:06:23.500Z" && d.TargetValue == "2026-11-01T03:06:23.000Z");
            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.DataDelimiter" && d.SourceValue == "," && d.TargetValue == ";");
            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.StepIncrement.Denominator" && d.SourceValue == "2" && d.TargetValue == "4");
            Assert.Contains(headerDiffs, d => d.PropertyPath == "Log.LogParam[Index=1].Value" && d.SourceValue == "1.25" && d.TargetValue == "1.30");

            var sourceCurve = new WitsmlLogCurveInfo
            {
                Uid = "c1",
                Mnemonic = "GR",
                MnemonicNamingSystem = "SLB",
                MnemAlias = "GAMMA",
                MnemAliasNamingSystem = "WITSML",
                WellDatum = "Kelly Bushing",
                WellDatumUidRef = "KB"
            };
            var targetCurve = new WitsmlLogCurveInfo
            {
                Uid = "c1",
                Mnemonic = "GR",
                MnemonicNamingSystem = "HAL",
                MnemAlias = "GAMMA",
                MnemAliasNamingSystem = "ENERGISTICS",
                WellDatum = "Kelly Bushing",
                WellDatumUidRef = "MSL"
            };

            var curveDiffs = _comparer.CompareLogCurveInfo(WitsmlLog.WITSML_INDEX_TYPE_MD, "log-1", "Depth Log", sourceCurve, targetCurve, options);
            Assert.Contains(curveDiffs, d => d.PropertyPath == "LogCurve[GR].MnemonicNamingSystem" && d.SourceValue == "SLB" && d.TargetValue == "HAL");
            Assert.Contains(curveDiffs, d => d.PropertyPath == "LogCurve[GR].MnemAliasNamingSystem" && d.SourceValue == "WITSML" && d.TargetValue == "ENERGISTICS");
            Assert.Contains(curveDiffs, d => d.PropertyPath == "LogCurve[GR].WellDatumUidRef" && d.SourceValue == "KB" && d.TargetValue == "MSL");
        }

        [Fact]
        public void Compare_ComputesAbsoluteDeltaForNumbersMeasuresAndTimestamps()
        {
            var source = new WitsmlWellbore
            {
                Uid = "wb1",
                Name = "2/8-V-10",
                TvdKickoff = new WitsmlWellVerticalDepthCoord { Value = "564.0974", Uom = "m" },
                MdBit = new WitsmlMeasuredDepthCoord { Value = "1500", Uom = "m" },
                DTimKickoff = "2026-11-01T04:06:23.767+01:00"
            };
            var target = new WitsmlWellbore
            {
                Uid = "wb1",
                Name = "2/8-V-10",
                TvdKickoff = new WitsmlWellVerticalDepthCoord { Value = "564.1", Uom = "m" },
                MdBit = new WitsmlMeasuredDepthCoord { Value = "1500", Uom = "ft" },
                DTimKickoff = "2026-11-01T04:06:23.000+01:00"
            };

            var options = new DeepComparisonOptions { TimezoneMode = TimezoneComparisonMode.Utc };
            var diffs = _comparer.CompareWellbore(source, target, options);

            var tvdDiff = diffs.Find(d => d.PropertyPath == "Wellbore.TvdKickoff");
            Assert.NotNull(tvdDiff);
            Assert.Equal("0.0026", tvdDiff.Delta);

            var unitOnlyDiff = diffs.Find(d => d.PropertyPath == "Wellbore.MdBit");
            Assert.NotNull(unitOnlyDiff);
            Assert.Null(unitOnlyDiff.Delta);

            var dTimDiff = diffs.Find(d => d.PropertyPath == "Wellbore.DTimKickoff");
            Assert.NotNull(dTimDiff);
            Assert.Equal("0.767", dTimDiff.Delta);
        }
    }
}
