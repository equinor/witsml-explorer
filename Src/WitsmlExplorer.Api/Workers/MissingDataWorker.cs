using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class MissingDataWorker : BaseWorker<MissingDataJob>, IWorker
    {
        public JobType JobType => JobType.MissingData;

        public MissingDataWorker(ILogger<MissingDataJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(MissingDataJob job, CancellationToken? cancellationToken = null)
        {
            IEnumerable<WellReference> wellReferences = job.WellReferences;
            IEnumerable<WellboreReference> wellboreReferences = job.WellboreReferences;
            IEnumerable<MissingDataCheck> missingDataChecks = job.MissingDataChecks;
            string jobId = job.JobInfo.Id;

            ValidateInput(missingDataChecks, wellReferences, wellboreReferences);

            List<MissingDataReportItem> missingDataItems = new() { };

            foreach (MissingDataCheck check in missingDataChecks)
            {
                switch (check.ObjectType)
                {
                    case EntityType.Well:
                        missingDataItems.AddRange(await CheckWell(check, wellReferences, wellboreReferences));
                        break;
                    case EntityType.Wellbore:
                        missingDataItems.AddRange(await CheckWellbore(check, wellReferences, wellboreReferences));
                        break;
                    default: // Any object on wellbore
                        missingDataItems.AddRange(await CheckObject(check, wellReferences, wellboreReferences));
                        break;
                }
            }

            MissingDataReport report = GetReport(missingDataItems, missingDataChecks, wellReferences, wellboreReferences);
            job.JobInfo.Report = report;

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Missing Data Agent Job Complete", jobId: jobId);
            return (workerResult, null);
        }

        private static void ValidateInput(IEnumerable<MissingDataCheck> missingDataChecks, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            if (!wellboreReferences.Any() && !wellReferences.Any())
            {
                throw new ArgumentException("Either wellReferences or wellboreReferences must be specified");
            }
            if (!missingDataChecks.Any())
            {
                throw new ArgumentException("MissingDataChecks must be specified");
            }
            if (wellboreReferences.Any() && wellReferences.Any())
            {
                throw new ArgumentException("Either wellReferences or wellboreReferences must be left empty");
            }
            if (missingDataChecks.Where(check => check.ObjectType == EntityType.Well && !check.Properties.Any()).Any())
            {
                throw new ArgumentException("Selecting properties is required for wells.");
            }
            if (missingDataChecks.Where(check => check.ObjectType == EntityType.Wellbore && !check.Properties.Any() && wellboreReferences.Any()).Any())
            {
                throw new ArgumentException("Selecting properties is required for wellbores when running Missing Data Agent on wellbores.");
            }
        }

        private async Task<IEnumerable<MissingDataReportItem>> CheckWell(MissingDataCheck check, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            if (!wellReferences.Any())
            {
                // Checking well properties when wellbores are selected, so we actually just want to check the parent well
                wellReferences = new WellReference
                {
                    WellName = wellboreReferences.First().WellName,
                    WellUid = wellboreReferences.First().WellUid
                }.AsItemInList();
            }

            var query = new WitsmlWells
            {
                Wells = wellReferences.Select(wellReference =>
                {
                    WitsmlWell well = new()
                    {
                        Uid = wellReference.WellUid,
                        Name = "",
                    };
                    QueryHelper.AddPropertiesToObject(well, check.Properties.ToList());
                    return well;
                }).ToList()
            };
            WitsmlWells result = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));

            return CheckResultProperties(result.Wells, check);
        }

        private async Task<List<MissingDataReportItem>> CheckWellbore(MissingDataCheck check, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            var query = new WitsmlWellbores
            {
                Wellbores = wellboreReferences.Any()
                ? wellboreReferences.Select(wellboreReference =>
                    {
                        WitsmlWellbore wellbore = new()
                        {
                            Uid = wellboreReference.WellboreUid,
                            UidWell = wellboreReference.WellUid,
                            Name = "",
                            NameWell = "",
                        };
                        QueryHelper.AddPropertiesToObject(wellbore, check.Properties.ToList());
                        return wellbore;
                    }).ToList()
                : wellReferences.Select(wellReference =>
                    {
                        WitsmlWellbore wellbore = new()
                        {
                            Uid = "",
                            UidWell = wellReference.WellUid,
                            Name = "",
                            NameWell = "",
                        };
                        QueryHelper.AddPropertiesToObject(wellbore, check.Properties.ToList());
                        return wellbore;
                    }).ToList()
            };
            WitsmlWellbores result = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));

            return check.Properties.Any()
                ? CheckResultProperties(result.Wellbores, check)
                : CheckResultWellboreEmpty(result, check, wellReferences);
        }


        private async Task<List<MissingDataReportItem>> CheckObject(MissingDataCheck check, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            IWitsmlObjectList query = EntityTypeHelper.ToObjectList(check.ObjectType);
            query.Objects = wellboreReferences.Any()
                ? wellboreReferences.Select(wellboreReference =>
                    {
                        var o = EntityTypeHelper.ToObjectOnWellbore(check.ObjectType);
                        o.Uid = "";
                        o.Name = "";
                        o.UidWellbore = wellboreReference.WellboreUid;
                        o.NameWellbore = "";
                        o.UidWell = wellboreReference.WellUid;
                        o.NameWell = "";
                        QueryHelper.AddPropertiesToObject(o, check.Properties.ToList());
                        return o;
                    }).ToList()
                : wellReferences.Select(wellReference =>
                    {
                        var o = EntityTypeHelper.ToObjectOnWellbore(check.ObjectType);
                        o.Uid = "";
                        o.Name = "";
                        o.UidWellbore = "";
                        o.NameWellbore = "";
                        o.UidWell = wellReference.WellUid;
                        o.NameWell = "";
                        QueryHelper.AddPropertiesToObject(o, check.Properties.ToList());
                        return o;
                    }).ToList();

            IWitsmlObjectList result = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(query, new OptionsIn(ReturnElements.Requested));

            return check.Properties.Any()
                ? CheckResultProperties(result.Objects?.ToList(), check)
                : await CheckResultObjectEmpty(result, check, wellReferences, wellboreReferences);
        }
        private static List<MissingDataReportItem> CheckResultWellboreEmpty(WitsmlWellbores result, MissingDataCheck check, IEnumerable<WellReference> wellReferences)
        {
            List<MissingDataReportItem> missingDataItems = new() { };

            foreach (var wellReference in wellReferences)
            {
                if (!result.Wellbores.Any(wellbore => wellbore.UidWell == wellReference.WellUid))
                {
                    missingDataItems.Add(GetReportItem(wellReference, "", check.ObjectType));
                }
            }

            return missingDataItems;
        }

        private async Task<List<MissingDataReportItem>> CheckResultObjectEmpty(IWitsmlObjectList result, MissingDataCheck check, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            List<MissingDataReportItem> missingDataItems = new() { };

            if (wellReferences.Any())
            {
                var wellboreQuery = new WitsmlWellbores
                {
                    Wellbores = wellReferences.Select(wellReference => new WitsmlWellbore
                    {
                        Uid = "",
                        UidWell = wellReference.WellUid,
                        Name = "",
                        NameWell = "",
                    }
                    ).ToList()
                };
                WitsmlWellbores wellbores = await GetTargetWitsmlClientOrThrow().GetFromStoreNullableAsync(wellboreQuery, new OptionsIn(ReturnElements.Requested));
                wellboreReferences = wellbores.Wellbores.Select(wellbore => new WellboreReference
                {
                    WellUid = wellbore.UidWell,
                    WellName = wellbore.NameWell,
                    WellboreUid = wellbore.Uid,
                    WellboreName = wellbore.Name
                });

                foreach (var wellReference in wellReferences)
                {
                    if (!wellboreReferences.Any(wellboreReference => wellboreReference.WellUid == wellReference.WellUid))
                    {
                        // If a well does not have any wellbores, it doesn't have any objects either
                        missingDataItems.Add(GetReportItem(wellReference, "", check.ObjectType));
                    }
                }
            }

            if (wellboreReferences.Any())
            {
                foreach (var wellboreReference in wellboreReferences)
                {
                    if (!result.Objects.Any(o => o.UidWellbore == wellboreReference.WellboreUid))
                    {
                        missingDataItems.Add(GetReportItem(wellboreReference, "", check.ObjectType));
                    }
                }
            }

            return missingDataItems;
        }

        private static List<MissingDataReportItem> CheckResultProperties<T>(List<T> result, MissingDataCheck check)
        {
            List<MissingDataReportItem> missingDataItems = new() { };

            foreach (T resultObject in result)
            {
                foreach (string property in check.Properties)
                {
                    var propertyValue = QueryHelper.GetPropertyFromObject(resultObject, property);
                    if (IsPropertyEmpty(propertyValue))
                    {
                        missingDataItems.Add(GetReportItem(resultObject, property, check.ObjectType));
                    }
                }
            };

            return missingDataItems;
        }

        private static MissingDataReportItem GetReportItem<T>(T resultObject, string property, EntityType objectType)
        {
            return resultObject switch
            {
                WitsmlWell well => new MissingDataReportItem
                {
                    ObjectType = objectType.ToString(),
                    Property = property,
                    WellUid = well.Uid,
                    WellName = well.Name,
                    WellboreUid = "",
                    WellboreName = "",
                    ObjectUid = "",
                    ObjectName = ""
                },
                WitsmlWellbore wellbore => new MissingDataReportItem
                {
                    ObjectType = objectType.ToString(),
                    Property = property,
                    WellUid = wellbore.UidWell,
                    WellName = wellbore.NameWell,
                    WellboreUid = wellbore.Uid,
                    WellboreName = wellbore.Name,
                    ObjectUid = "",
                    ObjectName = ""
                },
                WitsmlObjectOnWellbore objectOnWellbore => new MissingDataReportItem
                {
                    ObjectType = objectType.ToString(),
                    Property = property,
                    WellUid = objectOnWellbore.UidWell,
                    WellName = objectOnWellbore.NameWell,
                    WellboreUid = objectOnWellbore.UidWellbore,
                    WellboreName = objectOnWellbore.NameWellbore,
                    ObjectUid = objectOnWellbore.Uid,
                    ObjectName = objectOnWellbore.Name
                },
                WellReference wellReference => new MissingDataReportItem
                {
                    ObjectType = objectType.ToString(),
                    Property = property,
                    WellUid = wellReference.WellUid,
                    WellName = wellReference.WellName,
                    WellboreUid = "",
                    WellboreName = "",
                    ObjectUid = "",
                    ObjectName = ""
                },
                WellboreReference wellboreReference => new MissingDataReportItem
                {
                    ObjectType = objectType.ToString(),
                    Property = property,
                    WellUid = wellboreReference.WellUid,
                    WellName = wellboreReference.WellName,
                    WellboreUid = wellboreReference.WellboreUid,
                    WellboreName = wellboreReference.WellboreName,
                    ObjectUid = "",
                    ObjectName = ""
                },
                _ => throw new Exception($"Expected resultObject to be of type WitsmlWell, WitsmlWellbore, WitsmlObjectOnWellbore, WellReference or WellboreReference, but got {typeof(T)}"),
            };
        }

        public static bool IsPropertyEmpty(object property)
        {
            Type propertyType = property?.GetType();
            if (property == null)
                return true;
            if (propertyType == typeof(string))
                return string.IsNullOrEmpty((string)property);
            if (propertyType.IsGenericType && propertyType.GetGenericTypeDefinition() == typeof(List<>))
                return ((IList)property).Count == 0;
            if (propertyType.IsClass)
                // Recursively check if all properties of a class are empty
                return !propertyType.GetProperties().Select(p => p.GetValue(property)).Any(p => !IsPropertyEmpty(p));
            return false;
        }

        private static MissingDataReport GetReport(List<MissingDataReportItem> missingDataItems, IEnumerable<MissingDataCheck> checks, IEnumerable<WellReference> wellReferences, IEnumerable<WellboreReference> wellboreReferences)
        {
            string checkObjectsSummary = wellboreReferences.Any()
                ? $"Checked wellbores for well {wellboreReferences.First().WellName}: {string.Join(", ", wellboreReferences.Select(r => r.WellboreName))}"
                : $"Checked wells: {string.Join(", ", wellReferences.Select(r => r.WellName))}";
            string checkSummary = string.Join("\n\n", checks.Select(check => check.Properties.Any() ? $"Checked properties for {check.ObjectType}: {string.Join(", ", check.Properties)}" : $"Checked presence of {check.ObjectType}"));
            return new MissingDataReport
            {
                Title = $"Missing Data Report",
                Summary = missingDataItems.Count > 0
                    ? $"Found {missingDataItems.Count} cases of missing data.\n{checkObjectsSummary}\n\n{checkSummary}"
                    : $"No missing data was found.\n{checkObjectsSummary}\n\n{checkSummary}",
                ReportItems = missingDataItems
            };
        }
    }
}
