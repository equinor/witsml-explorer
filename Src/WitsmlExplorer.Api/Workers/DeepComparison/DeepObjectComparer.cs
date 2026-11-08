using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;

using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Data.Measures;
using Witsml.Data.MudLog;
using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;

namespace WitsmlExplorer.Api.Workers.DeepComparison
{
    public interface IDeepObjectComparer
    {
        List<WellboreSubObjectsComparisonItem> CompareObjects(
            EntityType entityType,
            WitsmlObjectOnWellbore sourceObj,
            WitsmlObjectOnWellbore targetObj,
            DeepComparisonOptions options);

        List<WellboreSubObjectsComparisonItem> CompareLogCurveInfo(
            string logType,
            string logUid,
            string logName,
            WitsmlLogCurveInfo sourceCurve,
            WitsmlLogCurveInfo targetCurve,
            DeepComparisonOptions options);

        List<WellboreSubObjectsComparisonItem> CompareWell(
            WitsmlWell sourceWell,
            WitsmlWell targetWell,
            DeepComparisonOptions options);

        List<WellboreSubObjectsComparisonItem> CompareWellbore(
            WitsmlWellbore sourceWellbore,
            WitsmlWellbore targetWellbore,
            DeepComparisonOptions options);

        List<WellboreSubObjectsComparisonItem> CompareLogHeader(
            WitsmlLog sourceLog,
            WitsmlLog targetLog,
            DeepComparisonOptions options);

        string FormatValueForReport(
            string val,
            string propertyPath,
            DeepComparisonOptions options);
    }

    public class DeepComparisonOptions
    {
        public bool OmitCustomData { get; init; } = true;
        public bool OmitTimestamps { get; init; } = true;
        public DecimalComparisonMode DecimalMode { get; init; } = DecimalComparisonMode.ServerSettings;
        public int? DecimalPlaces { get; init; }
        public TimezoneComparisonMode TimezoneMode { get; init; } = TimezoneComparisonMode.Utc;
        public string Timezone { get; init; }
        public bool MatchByNameIfUidDiffers { get; init; }
        public bool ReportAllMismatches { get; init; } = true;
        public int MaxMismatchesLimit { get; init; } = 500;
    }

    public class DeepObjectComparer : IDeepObjectComparer
    {
        private static readonly HashSet<string> IgnoredProperties = new(StringComparer.OrdinalIgnoreCase)
        {
            "UidWell",
            "UidWellbore",
            "NameWell",
            "NameWellbore",
            "AsItemInWitsmlList",
            "LogData",
            "AllElements",
            "AcquisitionTimeZone",
            "DefaultDatum",
            "MnemonicObject",
            "MnemAliasObject",
            "WellDatumRef"
        };

        private static readonly HashSet<string> IgnoredLogHeaderProperties = new(StringComparer.OrdinalIgnoreCase)
        {
            "LogCurveInfo",
            "LogData"
        };

        private static readonly HashSet<string> IgnoredCurveProperties = new(StringComparer.OrdinalIgnoreCase)
        {
            "Mnemonic",
            "Unit",
            "MinIndex",
            "MaxIndex",
            "MinDateTimeIndex",
            "MaxDateTimeIndex",
            "TypeName"
        };

        public List<WellboreSubObjectsComparisonItem> CompareLogCurveInfo(
            string logType,
            string logUid,
            string logName,
            WitsmlLogCurveInfo sourceCurve,
            WitsmlLogCurveInfo targetCurve,
            DeepComparisonOptions options)
        {
            List<WellboreSubObjectsComparisonItem> items = new();
            if (sourceCurve == null || targetCurve == null) return items;

            string mnemonic = sourceCurve.Mnemonic ?? targetCurve.Mnemonic ?? string.Empty;
            string basePath = $"LogCurve[{mnemonic}]";

            PropertyInfo[] properties = typeof(WitsmlLogCurveInfo).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in properties)
            {
                if (!options.ReportAllMismatches && items.Count >= options.MaxMismatchesLimit)
                {
                    return items;
                }

                if (!prop.CanRead) continue;

                string propName = prop.Name;
                if (IgnoredCurveProperties.Contains(propName)) continue;
                if (IgnoredProperties.Contains(propName)) continue;

                if (options.MatchByNameIfUidDiffers && string.Equals(propName, "Uid", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                object sVal = prop.GetValue(sourceCurve);
                object tVal = prop.GetValue(targetCurve);

                string currentPath = $"{basePath}.{propName}";
                CompareRecursive(sVal, tVal, "Log", logUid, logName, currentPath, items, options);
            }

            foreach (var item in items)
            {
                if (string.IsNullOrEmpty(item.Mnemonic))
                {
                    item.Mnemonic = mnemonic;
                }
                if (string.IsNullOrEmpty(item.LogType))
                {
                    item.LogType = logType;
                }
                if (string.IsNullOrEmpty(item.IndexOrKey))
                {
                    item.IndexOrKey = mnemonic;
                }
            }

            return items;
        }

        public List<WellboreSubObjectsComparisonItem> CompareWell(
            WitsmlWell sourceWell,
            WitsmlWell targetWell,
            DeepComparisonOptions options)
        {
            List<WellboreSubObjectsComparisonItem> items = new();
            if (sourceWell == null && targetWell == null) return items;

            string objUid = sourceWell?.Uid ?? targetWell?.Uid ?? string.Empty;
            string objName = sourceWell?.Name ?? targetWell?.Name ?? string.Empty;

            if (sourceWell == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Well",
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnSource",
                    ExistsOnSource = "FALSE",
                    ExistsOnTarget = "TRUE",
                    Description = "Well exists only on target server."
                });
                return items;
            }

            if (targetWell == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Well",
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnTarget",
                    ExistsOnSource = "TRUE",
                    ExistsOnTarget = "FALSE",
                    Description = "Well exists only on source server."
                });
                return items;
            }

            SortChildCollections(sourceWell);
            SortChildCollections(targetWell);

            CompareRecursive(sourceWell, targetWell, "Well", objUid, objName, "Well", items, options);

            return items;
        }

        public List<WellboreSubObjectsComparisonItem> CompareWellbore(
            WitsmlWellbore sourceWellbore,
            WitsmlWellbore targetWellbore,
            DeepComparisonOptions options)
        {
            List<WellboreSubObjectsComparisonItem> items = new();
            if (sourceWellbore == null && targetWellbore == null) return items;

            string objUid = sourceWellbore?.Uid ?? targetWellbore?.Uid ?? string.Empty;
            string objName = sourceWellbore?.Name ?? targetWellbore?.Name ?? string.Empty;

            if (sourceWellbore == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Wellbore",
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnSource",
                    ExistsOnSource = "FALSE",
                    ExistsOnTarget = "TRUE",
                    Description = "Wellbore exists only on target server."
                });
                return items;
            }

            if (targetWellbore == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = "Wellbore",
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnTarget",
                    ExistsOnSource = "TRUE",
                    ExistsOnTarget = "FALSE",
                    Description = "Wellbore exists only on source server."
                });
                return items;
            }

            SortChildCollections(sourceWellbore);
            SortChildCollections(targetWellbore);

            CompareRecursive(sourceWellbore, targetWellbore, "Wellbore", objUid, objName, "Wellbore", items, options);

            return items;
        }

        public List<WellboreSubObjectsComparisonItem> CompareLogHeader(
            WitsmlLog sourceLog,
            WitsmlLog targetLog,
            DeepComparisonOptions options)
        {
            List<WellboreSubObjectsComparisonItem> items = new();
            if (sourceLog == null || targetLog == null) return items;

            string logUid = sourceLog.Uid ?? targetLog.Uid ?? string.Empty;
            string logName = sourceLog.Name ?? targetLog.Name ?? string.Empty;
            string logType = sourceLog.IndexType ?? targetLog.IndexType;

            PropertyInfo[] properties = typeof(WitsmlLog).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in properties)
            {
                if (!options.ReportAllMismatches && items.Count >= options.MaxMismatchesLimit)
                {
                    break;
                }

                if (!prop.CanRead) continue;

                string propName = prop.Name;
                if (IgnoredLogHeaderProperties.Contains(propName)) continue;
                if (IgnoredProperties.Contains(propName)) continue;

                if (options.OmitCustomData && string.Equals(propName, "CustomData", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (options.MatchByNameIfUidDiffers && string.Equals(propName, "Uid", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                object sVal = prop.GetValue(sourceLog);
                object tVal = prop.GetValue(targetLog);

                string currentPath = $"Log.{propName}";
                CompareRecursive(sVal, tVal, "Log", logUid, logName, currentPath, items, options);
            }

            // Remove duplicate StartIndex.Uom / EndIndex.Uom unit mismatches already reported by FindLogUnitDifferences
            items.RemoveAll(i =>
                i.DifferenceType == "UnitMismatch" &&
                (string.Equals(i.PropertyPath, "Log.StartIndex.Uom", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(i.PropertyPath, "Log.EndIndex.Uom", StringComparison.OrdinalIgnoreCase)));

            foreach (var item in items)
            {
                if (string.IsNullOrEmpty(item.LogType))
                {
                    item.LogType = logType;
                }
            }

            return items;
        }

        public List<WellboreSubObjectsComparisonItem> CompareObjects(
            EntityType entityType,
            WitsmlObjectOnWellbore sourceObj,
            WitsmlObjectOnWellbore targetObj,
            DeepComparisonOptions options)
        {
            List<WellboreSubObjectsComparisonItem> items = new();
            if (sourceObj == null && targetObj == null) return items;

            string objectTypeStr = entityType.ToString();
            string objUid = sourceObj?.Uid ?? targetObj?.Uid ?? string.Empty;
            string objName = sourceObj?.Name ?? targetObj?.Name ?? string.Empty;

            if (sourceObj == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = objectTypeStr,
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnSource",
                    ExistsOnSource = "FALSE",
                    ExistsOnTarget = "TRUE",
                    Description = $"Object exists only on target server."
                });
                return items;
            }

            if (targetObj == null)
            {
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = objectTypeStr,
                    ObjectUid = objUid,
                    ObjectName = objName,
                    DifferenceType = "MissingOnTarget",
                    ExistsOnSource = "TRUE",
                    ExistsOnTarget = "FALSE",
                    Description = $"Object exists only on source server."
                });
                return items;
            }

            SortChildCollections(sourceObj);
            SortChildCollections(targetObj);

            CompareRecursive(sourceObj, targetObj, objectTypeStr, objUid, objName, objectTypeStr, items, options);

            return items;
        }

        private void SortChildCollections(object obj)
        {
            if (obj == null) return;

            if (obj is WitsmlTrajectory trajectory && trajectory.TrajectoryStations != null)
            {
                trajectory.TrajectoryStations = trajectory.TrajectoryStations
                    .OrderBy(s => TryParseDouble(s.Md?.Value, out double md) ? md : double.MaxValue)
                    .ThenBy(s => TryParseUtcTicks(s.DTimStn))
                    .ThenBy(s => s.DTimStn ?? string.Empty)
                    .ThenBy(s => s.Uid ?? string.Empty)
                    .ToList();
            }
            else if (obj is WitsmlTubular tubular && tubular.TubularComponents != null)
            {
                tubular.TubularComponents = tubular.TubularComponents
                    .OrderBy(c => c.Sequence ?? int.MaxValue)
                    .ThenBy(c => c.Uid ?? string.Empty)
                    .ToList();
            }
            else if (obj is WitsmlMudLog mudLog)
            {
                if (mudLog.GeologyInterval != null)
                {
                    mudLog.GeologyInterval = mudLog.GeologyInterval
                        .OrderBy(g => TryParseDouble(g.MdTop?.Value, out double md) ? md : double.MaxValue)
                        .ThenBy(g => g.Uid ?? string.Empty)
                        .ToList();
                }
                if (mudLog.MudLogParameters != null)
                {
                    mudLog.MudLogParameters = mudLog.MudLogParameters
                        .OrderBy(p => TryParseDouble(p.MdTop?.Value, out double md) ? md : double.MaxValue)
                        .ThenBy(p => TryParseUtcTicks(p.DTime))
                        .ThenBy(p => p.Uid ?? string.Empty)
                        .ToList();
                }
                if (mudLog.RelatedLog != null)
                {
                    mudLog.RelatedLog = mudLog.RelatedLog
                        .OrderBy(r => r.UidRef ?? string.Empty)
                        .ThenBy(r => r.Value ?? string.Empty)
                        .ToList();
                }
            }
            else if (obj is WitsmlBhaRun bhaRun && bhaRun.DrillingParams != null)
            {
                bhaRun.DrillingParams = bhaRun.DrillingParams
                    .OrderBy(d => TryParseDouble(d.MdHoleStart?.Value, out double md) ? md : double.MaxValue)
                    .ThenBy(d => d.Uid ?? string.Empty)
                    .ToList();
            }
            else if (obj is WitsmlFluidsReport fluidsReport && fluidsReport.Fluids != null)
            {
                fluidsReport.Fluids = fluidsReport.Fluids
                    .OrderBy(f => TryParseUtcTicks(f.DTim))
                    .ThenBy(f => f.DTim ?? string.Empty)
                    .ThenBy(f => f.Uid ?? string.Empty)
                    .ToList();
            }
            else if (obj is WitsmlWbGeometry wbGeometry && wbGeometry.WbGeometrySections != null)
            {
                wbGeometry.WbGeometrySections = wbGeometry.WbGeometrySections
                    .OrderBy(s => TryParseDouble(s.MdTop?.Value, out double md) ? md : double.MaxValue)
                    .ThenBy(s => s.Uid ?? string.Empty)
                    .ToList();
            }
            else if (obj is WitsmlWell well)
            {
                if (well.WellDatum != null)
                    well.WellDatum = well.WellDatum.OrderBy(d => d.Uid ?? string.Empty).ThenBy(d => d.Name ?? string.Empty).ToList();
                if (well.WellLocation != null)
                    well.WellLocation = well.WellLocation.OrderBy(l => l.Uid ?? string.Empty).ToList();
                if (well.ReferencePoint != null)
                    well.ReferencePoint = well.ReferencePoint.OrderBy(r => r.Uid ?? string.Empty).ThenBy(r => r.Name ?? string.Empty).ToList();
                if (well.WellCRS != null)
                    well.WellCRS = well.WellCRS.OrderBy(c => c.Uid ?? string.Empty).ThenBy(c => c.Name ?? string.Empty).ToList();
            }
        }

        private void CompareRecursive(
            object source,
            object target,
            string objectType,
            string objectUid,
            string objectName,
            string currentPath,
            List<WellboreSubObjectsComparisonItem> items,
            DeepComparisonOptions options)
        {
            if (!options.ReportAllMismatches && items.Count >= options.MaxMismatchesLimit)
            {
                return;
            }

            if (source == null && target == null) return;

            Type type = (source ?? target).GetType();

            if (type.IsPrimitive || type == typeof(string) || type == typeof(decimal) || type.IsEnum || type == typeof(DateTime))
            {
                ComparePrimitiveValues(source, target, objectType, objectUid, objectName, currentPath, items, options);
                return;
            }

            if (typeof(Measure).IsAssignableFrom(type))
            {
                CompareMeasure((Measure)source, (Measure)target, objectType, objectUid, objectName, currentPath, items, options);
                return;
            }

            if (typeof(IEnumerable).IsAssignableFrom(type) && type != typeof(string))
            {
                CompareCollections((IEnumerable)source, (IEnumerable)target, objectType, objectUid, objectName, currentPath, items, options);
                return;
            }

            PropertyInfo[] properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in properties)
            {
                if (!options.ReportAllMismatches && items.Count >= options.MaxMismatchesLimit)
                {
                    return;
                }

                if (!prop.CanRead) continue;

                string propName = prop.Name;
                if (IgnoredProperties.Contains(propName)) continue;

                if (options.OmitCustomData && string.Equals(propName, "CustomData", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (options.OmitTimestamps && (
                    string.Equals(propName, "DTimCreation", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(propName, "DTimLastChange", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(propName, "DTimCreationText", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(propName, "DTimLastChangeText", StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                if (options.MatchByNameIfUidDiffers && string.Equals(propName, "Uid", StringComparison.OrdinalIgnoreCase) && currentPath == objectType)
                {
                    continue;
                }

                if (propName.EndsWith("Text", StringComparison.OrdinalIgnoreCase))
                {
                    string nonTextPropName = propName[..^4];
                    if (properties.Any(p => string.Equals(p.Name, nonTextPropName, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }
                }

                object sourceVal = source != null ? prop.GetValue(source) : null;
                object targetVal = target != null ? prop.GetValue(target) : null;

                string displayPropName = propName switch
                {
                    "AcquisitionTimeZoneObject" => "AcquisitionTimeZone",
                    "DefaultDatumRef" => "DefaultDatum",
                    _ => propName
                };

                string nextPath = $"{currentPath}.{displayPropName}";
                CompareRecursive(sourceVal, targetVal, objectType, objectUid, objectName, nextPath, items, options);
            }
        }

        private void CompareCollections(
            IEnumerable sourceCol,
            IEnumerable targetCol,
            string objectType,
            string objectUid,
            string objectName,
            string currentPath,
            List<WellboreSubObjectsComparisonItem> items,
            DeepComparisonOptions options)
        {
            List<object> sourceList = sourceCol?.Cast<object>().ToList() ?? new List<object>();
            List<object> targetList = targetCol?.Cast<object>().ToList() ?? new List<object>();

            if (sourceList.Count == 0 && targetList.Count == 0) return;

            string keyPropName = DetermineKeyProperty(sourceList.Concat(targetList).FirstOrDefault(x => x != null));

            if (string.IsNullOrEmpty(keyPropName))
            {
                int maxCount = Math.Max(sourceList.Count, targetList.Count);
                for (int i = 0; i < maxCount; i++)
                {
                    object sItem = i < sourceList.Count ? sourceList[i] : null;
                    object tItem = i < targetList.Count ? targetList[i] : null;
                    CompareRecursive(sItem, tItem, objectType, objectUid, objectName, $"{currentPath}[{i}]", items, options);
                }
                return;
            }

            Dictionary<string, object> sourceDict = new();
            for (int i = 0; i < sourceList.Count; i++)
            {
                object s = sourceList[i];
                string key = GetItemKey(s, keyPropName, options);
                if (string.IsNullOrEmpty(key) || sourceDict.ContainsKey(key))
                {
                    key = string.IsNullOrEmpty(key) ? $"#{i}" : $"{key}#{i}";
                }
                sourceDict[key] = s;
            }

            Dictionary<string, object> targetDict = new();
            for (int i = 0; i < targetList.Count; i++)
            {
                object t = targetList[i];
                string key = GetItemKey(t, keyPropName, options);
                if (string.IsNullOrEmpty(key) || targetDict.ContainsKey(key))
                {
                    key = string.IsNullOrEmpty(key) ? $"#{i}" : $"{key}#{i}";
                }
                targetDict[key] = t;
            }

            List<string> allKeys = sourceDict.Keys.Union(targetDict.Keys).OrderBy(k => k).ToList();
            foreach (string key in allKeys)
            {
                sourceDict.TryGetValue(key, out object sItem);
                targetDict.TryGetValue(key, out object tItem);

                string itemPath = $"{currentPath}[{keyPropName}={key}]";

                if (sItem == null)
                {
                    items.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = objectType,
                        ObjectUid = objectUid,
                        ObjectName = objectName,
                        DifferenceType = "SubObjectMissingOnSource",
                        PropertyPath = itemPath,
                        IndexOrKey = key,
                        ExistsOnSource = "FALSE",
                        ExistsOnTarget = "TRUE",
                        Description = $"Child item with {keyPropName}='{key}' exists only on target."
                    });
                    continue;
                }

                if (tItem == null)
                {
                    items.Add(new WellboreSubObjectsComparisonItem
                    {
                        ObjectType = objectType,
                        ObjectUid = objectUid,
                        ObjectName = objectName,
                        DifferenceType = "SubObjectMissingOnTarget",
                        PropertyPath = itemPath,
                        IndexOrKey = key,
                        ExistsOnSource = "TRUE",
                        ExistsOnTarget = "FALSE",
                        Description = $"Child item with {keyPropName}='{key}' exists only on source."
                    });
                    continue;
                }

                CompareRecursive(sItem, tItem, objectType, objectUid, objectName, itemPath, items, options);
            }
        }

        private static string DetermineKeyProperty(object sampleItem)
        {
            if (sampleItem == null) return null;
            Type t = sampleItem.GetType();
            if (t.IsPrimitive || t == typeof(string) || t == typeof(decimal)) return null;
            if (t.GetProperty("Mnemonic") != null) return "Mnemonic";
            if (t == typeof(WitsmlExtensionNameValue))
            {
                if (sampleItem is WitsmlExtensionNameValue env && !string.IsNullOrWhiteSpace(env.Name) && string.IsNullOrWhiteSpace(env.Uid))
                {
                    return "Name";
                }
                return "Uid";
            }
            if (t == typeof(WitsmlAxisDefinition)) return "Order";
            if (t == typeof(WitsmlProjectionParameter)) return "Index";

            string[] candidateProps = { "Uid", "Index", "Order", "Sequence", "Name", "Md", "MdTop", "DTim", "UidRef", "Kind" };
            foreach (string propName in candidateProps)
            {
                PropertyInfo p = t.GetProperty(propName);
                if (p != null)
                {
                    object val = p.GetValue(sampleItem);
                    string strVal = val is Measure m ? m.Value : val?.ToString();
                    if (!string.IsNullOrWhiteSpace(strVal))
                    {
                        return propName;
                    }
                }
            }

            foreach (string propName in candidateProps)
            {
                if (t.GetProperty(propName) != null) return propName;
            }
            return null;
        }

        private string GetItemKey(object item, string keyPropName, DeepComparisonOptions options = null)
        {
            if (item == null) return null;
            if (item is WitsmlExtensionNameValue env)
            {
                return !string.IsNullOrWhiteSpace(env.Uid) ? env.Uid : env.Name;
            }
            PropertyInfo prop = item.GetType().GetProperty(keyPropName);
            if (prop == null) return null;
            object val = prop.GetValue(item);
            if (val is Measure measure) return measure.Value;
            string key = val?.ToString();
            if (string.IsNullOrWhiteSpace(key)) return null;
            if (string.Equals(keyPropName, "DTim", StringComparison.OrdinalIgnoreCase) && options != null)
            {
                return FormatValueForReport(key, keyPropName, options);
            }
            return key;
        }

        private void CompareMeasure(
            Measure sourceMeasure,
            Measure targetMeasure,
            string objectType,
            string objectUid,
            string objectName,
            string currentPath,
            List<WellboreSubObjectsComparisonItem> items,
            DeepComparisonOptions options)
        {
            if (sourceMeasure == null && targetMeasure == null) return;

            string sVal = sourceMeasure?.Value;
            string tVal = targetMeasure?.Value;
            string sUom = sourceMeasure?.Uom;
            string tUom = targetMeasure?.Uom;

            bool valueEqual = AreValuesEqual(sVal, tVal, currentPath, options);
            bool uomEqual = string.Equals(sUom?.Trim(), tUom?.Trim(), StringComparison.OrdinalIgnoreCase);

            if (!valueEqual || !uomEqual)
            {
                bool isUnitOnly = !uomEqual && valueEqual;
                string measureDelta = (!valueEqual && uomEqual) ? CalculateDelta(sVal, tVal, currentPath) : null;
                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = objectType,
                    ObjectUid = objectUid,
                    ObjectName = objectName,
                    DifferenceType = isUnitOnly ? "UnitMismatch" : "MeasureMismatch",
                    PropertyPath = currentPath,
                    SourceValue = sourceMeasure != null ? $"{sVal} {sUom}".Trim() : "<null>",
                    TargetValue = targetMeasure != null ? $"{tVal} {tUom}".Trim() : "<null>",
                    Delta = measureDelta,
                    ExistsOnSource = sourceMeasure != null ? "TRUE" : "FALSE",
                    ExistsOnTarget = targetMeasure != null ? "TRUE" : "FALSE",
                    Description = !valueEqual && !uomEqual
                        ? $"Measure value and unit mismatch."
                        : !valueEqual ? "Measure value mismatch." : $"Unit mismatch for '{currentPath}': Source='{sUom}', Target='{tUom}'"
                });
            }

            if (sourceMeasure is WitsmlMeasureWithDatum || targetMeasure is WitsmlMeasureWithDatum)
            {
                string sDatum = (sourceMeasure as WitsmlMeasureWithDatum)?.Datum;
                string tDatum = (targetMeasure as WitsmlMeasureWithDatum)?.Datum;
                ComparePrimitiveValues(sDatum, tDatum, objectType, objectUid, objectName, $"{currentPath}.Datum", items, options);
            }

            if (sourceMeasure is WitsmlRatioGenericMeasure || targetMeasure is WitsmlRatioGenericMeasure)
            {
                string sNum = (sourceMeasure as WitsmlRatioGenericMeasure)?.Numerator;
                string tNum = (targetMeasure as WitsmlRatioGenericMeasure)?.Numerator;
                ComparePrimitiveValues(sNum, tNum, objectType, objectUid, objectName, $"{currentPath}.Numerator", items, options);

                string sDen = (sourceMeasure as WitsmlRatioGenericMeasure)?.Denominator;
                string tDen = (targetMeasure as WitsmlRatioGenericMeasure)?.Denominator;
                ComparePrimitiveValues(sDen, tDen, objectType, objectUid, objectName, $"{currentPath}.Denominator", items, options);
            }
        }

        private void ComparePrimitiveValues(
            object source,
            object target,
            string objectType,
            string objectUid,
            string objectName,
            string currentPath,
            List<WellboreSubObjectsComparisonItem> items,
            DeepComparisonOptions options)
        {
            string sStr = source?.ToString();
            string tStr = target?.ToString();

            if (!AreValuesEqual(sStr, tStr, currentPath, options))
            {
                bool isUnit = currentPath.EndsWith(".Unit", StringComparison.OrdinalIgnoreCase) ||
                              currentPath.EndsWith(".Uom", StringComparison.OrdinalIgnoreCase);

                string formattedSource = FormatValueForReport(sStr, currentPath, options);
                string formattedTarget = FormatValueForReport(tStr, currentPath, options);
                string primitiveDelta = !isUnit ? CalculateDelta(sStr, tStr, currentPath) : null;

                items.Add(new WellboreSubObjectsComparisonItem
                {
                    ObjectType = objectType,
                    ObjectUid = objectUid,
                    ObjectName = objectName,
                    DifferenceType = isUnit ? "UnitMismatch" : "ElementDifference",
                    PropertyPath = currentPath,
                    SourceValue = formattedSource,
                    TargetValue = formattedTarget,
                    Delta = primitiveDelta,
                    ExistsOnSource = source != null ? "TRUE" : "FALSE",
                    ExistsOnTarget = target != null ? "TRUE" : "FALSE",
                    Description = isUnit
                        ? $"Unit mismatch for '{currentPath}': Source='{formattedSource}', Target='{formattedTarget}'"
                        : $"Value mismatch for {currentPath}."
                });
            }
        }

        public static string CalculateDelta(string sourceVal, string targetVal, string propertyPath = null)
        {
            if (string.IsNullOrWhiteSpace(sourceVal) || string.IsNullOrWhiteSpace(targetVal)) return null;
            string sTrimmed = sourceVal.Trim();
            string tTrimmed = targetVal.Trim();
            if (sTrimmed == "<null>" || tTrimmed == "<null>") return null;

            if (decimal.TryParse(sTrimmed, NumberStyles.Float, CultureInfo.InvariantCulture, out decimal sDec) &&
                decimal.TryParse(tTrimmed, NumberStyles.Float, CultureInfo.InvariantCulture, out decimal tDec))
            {
                decimal diff = Math.Abs(sDec - tDec);
                return diff.ToString("0.############################", CultureInfo.InvariantCulture);
            }

            if (double.TryParse(sTrimmed, NumberStyles.Float, CultureInfo.InvariantCulture, out double sDbl) &&
                double.TryParse(tTrimmed, NumberStyles.Float, CultureInfo.InvariantCulture, out double tDbl) &&
                !double.IsNaN(sDbl) && !double.IsInfinity(sDbl) &&
                !double.IsNaN(tDbl) && !double.IsInfinity(tDbl))
            {
                double diff = Math.Abs(sDbl - tDbl);
                return diff.ToString("G15", CultureInfo.InvariantCulture);
            }

            if ((IsSingleDateTimePropertyOrValue(propertyPath, sTrimmed) || IsSingleDateTimePropertyOrValue(propertyPath, tTrimmed)) &&
                DateTimeOffset.TryParse(sTrimmed, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset sDto) &&
                DateTimeOffset.TryParse(tTrimmed, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset tDto))
            {
                decimal diffSeconds = Math.Abs(sDto.UtcTicks - tDto.UtcTicks) / (decimal)TimeSpan.TicksPerSecond;
                return diffSeconds.ToString("0.#######", CultureInfo.InvariantCulture);
            }

            return null;
        }

        public static string CalculateIndexRangeDelta(string srcMin, string srcMax, string tgtMin, string tgtMax, string propertyPath = null)
        {
            string startDelta = CalculateDelta(srcMin, tgtMin, propertyPath);
            string endDelta = CalculateDelta(srcMax, tgtMax, propertyPath);
            if (startDelta != null && endDelta != null &&
                decimal.TryParse(startDelta, NumberStyles.Float, CultureInfo.InvariantCulture, out decimal dStart) &&
                decimal.TryParse(endDelta, NumberStyles.Float, CultureInfo.InvariantCulture, out decimal dEnd))
            {
                return Math.Max(dStart, dEnd).ToString("0.############################", CultureInfo.InvariantCulture);
            }
            return endDelta ?? startDelta;
        }

        public string FormatValueForReport(string val, string propertyPath, DeepComparisonOptions options)
        {
            if (val == null) return "<null>";
            string trimmed = val.Trim();
            if (string.IsNullOrEmpty(trimmed) || options == null || options.TimezoneMode == TimezoneComparisonMode.Raw)
            {
                return val;
            }

            if (IsSingleDateTimePropertyOrValue(propertyPath, trimmed) &&
                DateTimeOffset.TryParse(trimmed, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset dto))
            {
                if (options.TimezoneMode == TimezoneComparisonMode.Utc)
                {
                    return FormatUtcDateTimeOffset(dto.ToUniversalTime());
                }

                if (options.TimezoneMode == TimezoneComparisonMode.AppSettings && !string.IsNullOrEmpty(options.Timezone))
                {
                    try
                    {
                        TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById(options.Timezone);
                        DateTimeOffset dtoTz = TimeZoneInfo.ConvertTime(dto, tz);
                        if (tz.BaseUtcOffset == TimeSpan.Zero && !tz.SupportsDaylightSavingTime)
                        {
                            return FormatUtcDateTimeOffset(dtoTz.ToUniversalTime());
                        }
                        return dtoTz.ToString("yyyy-MM-ddTHH:mm:ss.fffzzz", CultureInfo.InvariantCulture);
                    }
                    catch
                    {
                        return FormatUtcDateTimeOffset(dto.ToUniversalTime());
                    }
                }
            }

            return val;
        }

        private static string FormatUtcDateTimeOffset(DateTimeOffset utc)
        {
            if (utc.Ticks % TimeSpan.TicksPerMillisecond != 0)
            {
                return utc.ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ", CultureInfo.InvariantCulture);
            }
            return utc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture);
        }

        public bool AreValuesEqual(string sStr, string tStr, string propertyPath, DeepComparisonOptions options)
        {
            bool sEmpty = string.IsNullOrWhiteSpace(sStr);
            bool tEmpty = string.IsNullOrWhiteSpace(tStr);
            if (sEmpty && tEmpty) return true;
            if (sEmpty != tEmpty) return false;

            sStr = sStr.Trim();
            tStr = tStr.Trim();

            if (IsDateTimePropertyOrValue(propertyPath, sStr, tStr))
            {
                if (DateTimeOffset.TryParse(sStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset sDto) &&
                    DateTimeOffset.TryParse(tStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset tDto))
                {
                    if (options.TimezoneMode == TimezoneComparisonMode.Utc)
                    {
                        return sDto.ToUniversalTime() == tDto.ToUniversalTime();
                    }
                    if (options.TimezoneMode == TimezoneComparisonMode.AppSettings && !string.IsNullOrEmpty(options.Timezone))
                    {
                        try
                        {
                            TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById(options.Timezone);
                            DateTimeOffset sTz = TimeZoneInfo.ConvertTime(sDto, tz);
                            DateTimeOffset tTz = TimeZoneInfo.ConvertTime(tDto, tz);
                            return sTz == tTz;
                        }
                        catch
                        {
                            return sDto.ToUniversalTime() == tDto.ToUniversalTime();
                        }
                    }
                    if (options.TimezoneMode == TimezoneComparisonMode.Raw)
                    {
                        return sDto.EqualsExact(tDto);
                    }
                    return sDto == tDto;
                }
            }

            if (TryParseDouble(sStr, out double sNum) && TryParseDouble(tStr, out double tNum))
            {
                if (options.DecimalMode == DecimalComparisonMode.Raw)
                {
                    return sNum == tNum;
                }
                if (options.DecimalPlaces.HasValue && options.DecimalPlaces.Value >= 0)
                {
                    double sRounded = Math.Round(sNum, options.DecimalPlaces.Value, MidpointRounding.AwayFromZero);
                    double tRounded = Math.Round(tNum, options.DecimalPlaces.Value, MidpointRounding.AwayFromZero);
                    return sRounded == tRounded;
                }
                return sNum == tNum;
            }

            return string.Equals(sStr, tStr, StringComparison.Ordinal);
        }

        private static bool IsSingleDateTimePropertyOrValue(string propertyPath, string val)
        {
            if (string.IsNullOrWhiteSpace(val) || TryParseDouble(val, out _)) return false;

            bool hasDateIndicators = val.Contains('T') || val.Count(c => c == '-') >= 2 || val.Contains('/');
            if (!hasDateIndicators) return false;

            if (propertyPath != null)
            {
                if (propertyPath.EndsWith(".TimeZone", StringComparison.OrdinalIgnoreCase) ||
                    propertyPath.EndsWith(".AcquisitionTimeZone.Value", StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }

                if (propertyPath.Contains("DTim", StringComparison.OrdinalIgnoreCase) ||
                    propertyPath.Contains("Date", StringComparison.OrdinalIgnoreCase) ||
                    propertyPath.Contains("Time", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }

            return val.Contains('T') && val.Contains('-') && val.Contains(':');
        }

        private static bool IsDateTimePropertyOrValue(string propertyPath, string sStr, string tStr)
        {
            if (IsSingleDateTimePropertyOrValue(propertyPath, sStr) && IsSingleDateTimePropertyOrValue(propertyPath, tStr))
            {
                return true;
            }

            if ((sStr.Contains('T') || sStr.Contains('-')) && (tStr.Contains('T') || tStr.Contains('-')) &&
                !TryParseDouble(sStr, out _) && !TryParseDouble(tStr, out _))
            {
                return DateTimeOffset.TryParse(sStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out _) &&
                       DateTimeOffset.TryParse(tStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out _);
            }

            return false;
        }

        private static long TryParseUtcTicks(string val)
        {
            if (!string.IsNullOrWhiteSpace(val) &&
                DateTimeOffset.TryParse(val.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTimeOffset dto))
            {
                return dto.ToUniversalTime().UtcTicks;
            }
            return long.MaxValue;
        }

        private static bool TryParseDouble(string val, out double result)
        {
            return double.TryParse(val, NumberStyles.Float | NumberStyles.AllowThousands, CultureInfo.InvariantCulture, out result);
        }
    }
}
