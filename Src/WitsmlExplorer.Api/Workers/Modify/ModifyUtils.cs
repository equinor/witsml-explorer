using System;
using System.Collections.Generic;
using System.Linq;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public static class ModifyUtils
    {
        public static void VerifyMeasure(Measure measure, string name)
        {
            if (measure == null)
            {
                return;
            }
            if (string.IsNullOrEmpty(measure.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {name} cannot be empty");
            }
        }

        public static void VerifyString(string str, string name, int maxLength = 64, int? minLength = null)
        {
            if (str == string.Empty)
            {
                throw new InvalidOperationException($"{name} cannot be empty");
            }
            if (str?.Length > maxLength)
            {
                throw new InvalidOperationException($"{name} cannot be longer than {maxLength} characters");
            }
            if (minLength != null && str?.Length < minLength)
            {
                throw new InvalidOperationException($"{name} cannot be shorter than {minLength} characters");
            }
        }

        public static void VerifyAllowedValues(string value, List<string> allowedValues, string name)
        {
            if (value != null && !allowedValues.Contains(value, StringComparer.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"{value} is not an allowed value for {name}");
            }
        }

        // Properties not used when converting to WITSML can safely be added here.
        private static readonly Dictionary<EntityType, HashSet<string>> AllowedPropertiesToChange = new Dictionary<EntityType, HashSet<string>>
        {
            {
                EntityType.BhaRun, new HashSet<string>
                {
                    nameof(BhaRun.Name),
                    nameof(BhaRun.Tubular),
                    nameof(BhaRun.DTimStart),
                    nameof(BhaRun.DTimStop),
                    nameof(BhaRun.DTimStartDrilling),
                    nameof(BhaRun.DTimStopDrilling),
                    nameof(BhaRun.PlanDogleg),
                    nameof(BhaRun.ActDogleg),
                    nameof(BhaRun.ActDoglegMx),
                    nameof(BhaRun.StatusBha),
                    nameof(BhaRun.NumBitRun),
                    nameof(BhaRun.NumStringRun),
                    nameof(BhaRun.ReasonTrip),
                    nameof(BhaRun.ObjectiveBha),
                    nameof(BhaRun.CommonData)
                }
            },
            {
                EntityType.FluidsReport, new HashSet<string>
                {
                    nameof(FluidsReport.Name),
                    nameof(FormationMarker.CommonData)
                }
            },
            {
                EntityType.FormationMarker, new HashSet<string>
                {
                    nameof(FormationMarker.Name),
                    nameof(FormationMarker.MdPrognosed),
                    nameof(FormationMarker.TvdPrognosed),
                    nameof(FormationMarker.MdTopSample),
                    nameof(FormationMarker.TvdTopSample),
                    nameof(FormationMarker.ThicknessBed),
                    nameof(FormationMarker.ThicknessApparent),
                    nameof(FormationMarker.ThicknessPerpen),
                    nameof(FormationMarker.MdLogSample),
                    nameof(FormationMarker.TvdLogSample),
                    nameof(FormationMarker.Dip),
                    nameof(FormationMarker.DipDirection),
                    nameof(FormationMarker.Lithostratigraphic),
                    nameof(FormationMarker.Chronostratigraphic),
                    nameof(FormationMarker.Description),
                    nameof(FormationMarker.CommonData)
                }
            },
            {
                EntityType.Log, new HashSet<string>
                {
                    nameof(LogObject.Name),
                    nameof(LogObject.ServiceCompany),
                    nameof(LogObject.RunNumber),
                    nameof(LogObject.CommonData),
                    nameof(LogObject.Mnemonics), // This is not used when converting to WITSML
                }
            },
            {
                EntityType.Message, new HashSet<string>
                {
                    nameof(MessageObject.Name),
                    nameof(MessageObject.MessageText),
                    nameof(MessageObject.CommonData)
                }
            },
            {
                EntityType.MudLog, new HashSet<string>
                {
                    nameof(MudLog.Name),
                    nameof(MudLog.MudLogCompany),
                    nameof(MudLog.MudLogEngineers),
                    nameof(MudLog.CommonData)
                }
            },
            {
                EntityType.Rig, new HashSet<string>
                {
                    nameof(Rig.Name),
                    nameof(Rig.TypeRig),
                    nameof(Rig.DTimStartOp),
                    nameof(Rig.DTimEndOp),
                    nameof(Rig.YearEntService),
                    nameof(Rig.TelNumber),
                    nameof(Rig.FaxNumber),
                    nameof(Rig.EmailAddress),
                    nameof(Rig.NameContact),
                    nameof(Rig.RatingDrillDepth),
                    nameof(Rig.RatingWaterDepth),
                    nameof(Rig.AirGap),
                    nameof(Rig.Approvals),
                    nameof(Rig.ClassRig),
                    nameof(Rig.Manufacturer),
                    nameof(Rig.Owner),
                    nameof(Rig.Registration),
                    nameof(Rig.CommonData)
                }
            },
            {
                EntityType.Risk, new HashSet<string>
                {
                    nameof(Risk.Name),
                    nameof(Risk.Type),
                    nameof(Risk.Category),
                    nameof(Risk.SubCategory),
                    nameof(Risk.ExtendCategory),
                    nameof(Risk.AffectedPersonnel),
                    nameof(Risk.DTimStart),
                    nameof(Risk.DTimEnd),
                    nameof(Risk.MdBitStart),
                    nameof(Risk.MdBitEnd),
                    nameof(Risk.ProbabilityLevel),
                    nameof(Risk.Summary),
                    nameof(Risk.Details),
                    nameof(Risk.CommonData)
                }
            },
            {
                EntityType.Tubular, new HashSet<string>
                {
                    nameof(Tubular.Name),
                    nameof(Tubular.TypeTubularAssy),
                    nameof(Tubular.CommonData)
                }
            },
            {
                EntityType.Trajectory, new HashSet<string>
                {
                    nameof(Trajectory.Name),
                    nameof(Trajectory.ServiceCompany),
                    nameof(Trajectory.AziRef),
                    nameof(Trajectory.CommonData)
                }
            },
            {
                EntityType.WbGeometry, new HashSet<string>
                {
                    nameof(WbGeometry.Name),
                    nameof(WbGeometry.MdBottom),
                    nameof(WbGeometry.GapAir),
                    nameof(WbGeometry.DepthWaterMean),
                    nameof(WbGeometry.CommonData)
                }
            },
        };

        public static ObjectOnWellbore PrepareModification(ObjectOnWellbore obj, EntityType objectType, ILogger logger)
        {
            if (!AllowedPropertiesToChange.TryGetValue(objectType, out var allowedProperties))
            {
                throw new NotSupportedException($"ObjectType '{objectType}' is not supported");
            }

            return SetNotAllowedPropertiesToNull(obj, allowedProperties, logger);
        }

        private static ObjectOnWellbore SetNotAllowedPropertiesToNull(ObjectOnWellbore obj, HashSet<string> allowedPropertiesToChange, ILogger logger)
        {
            // The uids should not be changed, but are needed to identify the object
            allowedPropertiesToChange.Add(nameof(obj.WellUid));
            allowedPropertiesToChange.Add(nameof(obj.WellboreUid));
            allowedPropertiesToChange.Add(nameof(obj.Uid));

            foreach (var property in obj.GetType().GetProperties())
            {
                if (!allowedPropertiesToChange.Contains(property.Name) && property.GetValue(obj) != null)
                {
                    logger.LogWarning("Property '{propertyName}' should not be changed and will be set to null. If the change is intended, please update the AllowedPropertiesToChange list in ModifyUtils.cs", property.Name);
                    property.SetValue(obj, null);
                }
            }

            return obj;
        }

        public static void VerifyModification(ObjectOnWellbore obj)
        {
            if (obj == null)
            {
                throw new InvalidOperationException("Object cannot be null");
            }
            if (string.IsNullOrEmpty(obj.WellUid))
            {
                throw new InvalidOperationException("WellUid cannot be empty");
            }
            if (string.IsNullOrEmpty(obj.WellboreUid))
            {
                throw new InvalidOperationException("WellboreUid cannot be empty");
            }
            if (string.IsNullOrEmpty(obj.Uid))
            {
                throw new InvalidOperationException("Uid cannot be empty");
            }
            VerifyString(obj.Name, nameof(obj.Name));

            switch (obj)
            {
                case BhaRun bhaRun:
                    VerifyBhaRun(bhaRun);
                    break;
                case FluidsReport fluidsReport:
                    VerifyFluidsReport(fluidsReport);
                    break;
                case FormationMarker formationMarker:
                    VerifyFormationMarker(formationMarker);
                    break;
                case LogObject log:
                    VerifyLog(log);
                    break;
                case MessageObject message:
                    VerifyMessage(message);
                    break;
                case MudLog mudLog:
                    VerifyMudLog(mudLog);
                    break;
                case Rig rig:
                    VerifyRig(rig);
                    break;
                case Risk risk:
                    VerifyRisk(risk);
                    break;
                case Tubular tubular:
                    VerifyTubular(tubular);
                    break;
                case Trajectory trajectory:
                    VerifyTrajectory(trajectory);
                    break;
                case WbGeometry wbGeometry:
                    VerifyWbGeometry(wbGeometry);
                    break;
                default:
                    throw new NotSupportedException($"ObjectType '{obj.GetType().Name}' is not supported");
            }
        }

        private static readonly List<string> _allowedItemStates = new List<string> { "actual", "model", "plan", "unknown" };

        private static void VerifyBhaRun(BhaRun bhaRun)
        {
            VerifyMeasure(bhaRun.PlanDogleg, nameof(bhaRun.PlanDogleg));
            VerifyMeasure(bhaRun.ActDogleg, nameof(bhaRun.ActDogleg));
            VerifyMeasure(bhaRun.ActDoglegMx, nameof(bhaRun.ActDoglegMx));
            VerifyAllowedValues(bhaRun.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyFluidsReport(FluidsReport fluidsReport)
        {
            VerifyAllowedValues(fluidsReport.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyFormationMarker(FormationMarker formationMarker)
        {
            VerifyMeasure(formationMarker.MdPrognosed, nameof(formationMarker.MdPrognosed));
            VerifyMeasure(formationMarker.TvdPrognosed, nameof(formationMarker.TvdPrognosed));
            VerifyMeasure(formationMarker.MdTopSample, nameof(formationMarker.MdTopSample));
            VerifyMeasure(formationMarker.TvdTopSample, nameof(formationMarker.TvdTopSample));
            VerifyMeasure(formationMarker.ThicknessBed, nameof(formationMarker.ThicknessBed));
            VerifyMeasure(formationMarker.ThicknessApparent, nameof(formationMarker.ThicknessApparent));
            VerifyMeasure(formationMarker.ThicknessPerpen, nameof(formationMarker.ThicknessPerpen));
            VerifyMeasure(formationMarker.MdLogSample, nameof(formationMarker.MdLogSample));
            VerifyMeasure(formationMarker.TvdLogSample, nameof(formationMarker.TvdLogSample));
            VerifyMeasure(formationMarker.Dip, nameof(formationMarker.Dip));
            VerifyMeasure(formationMarker.DipDirection, nameof(formationMarker.DipDirection));
            if (formationMarker.Lithostratigraphic != null && string.IsNullOrEmpty(formationMarker.Lithostratigraphic.Kind))
            {
                throw new InvalidOperationException($"Kind for {formationMarker.Lithostratigraphic} cannot be empty");
            }
            if (formationMarker.Chronostratigraphic != null && string.IsNullOrEmpty(formationMarker.Chronostratigraphic.Kind))
            {
                throw new InvalidOperationException($"Kind for {formationMarker.Chronostratigraphic} cannot be empty");
            }
            VerifyAllowedValues(formationMarker.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyLog(LogObject log)
        {
            VerifyString(log.ServiceCompany, nameof(log.ServiceCompany));
            VerifyString(log.RunNumber, nameof(log.RunNumber), 16);
            VerifyAllowedValues(log.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyMessage(MessageObject message)
        {
            VerifyAllowedValues(message.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyMudLog(MudLog mudLog)
        {
            VerifyString(mudLog.MudLogCompany, nameof(mudLog.MudLogCompany));
            VerifyString(mudLog.MudLogEngineers, nameof(mudLog.MudLogEngineers), 256);
            VerifyAllowedValues(mudLog.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyRig(Rig rig)
        {
            VerifyAllowedValues(rig.TypeRig, new List<string> { "barge", "coiled tubing", "floater", "jackup", "land", "platform", "semi-submersible", "unknown" }, nameof(rig.TypeRig));
            VerifyString(rig.YearEntService, nameof(rig.YearEntService), 4, 4);
            VerifyString(rig.Owner, nameof(rig.Owner), 32);
            VerifyString(rig.Manufacturer, nameof(rig.Manufacturer), 64);
            VerifyString(rig.ClassRig, nameof(rig.ClassRig), 32);
            VerifyString(rig.Approvals, nameof(rig.Approvals), 64);
            VerifyString(rig.Registration, nameof(rig.Registration), 32);
            VerifyMeasure(rig.RatingDrillDepth, nameof(rig.RatingDrillDepth));
            VerifyMeasure(rig.RatingWaterDepth, nameof(rig.RatingWaterDepth));
            VerifyMeasure(rig.AirGap, nameof(rig.AirGap));
            VerifyAllowedValues(rig.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyRisk(Risk risk)
        {
            VerifyMeasure(risk.MdBitStart, nameof(risk.MdBitStart));
            VerifyMeasure(risk.MdBitEnd, nameof(risk.MdBitEnd));
            VerifyAllowedValues(risk.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyTubular(Tubular tubular)
        {
            VerifyAllowedValues(tubular.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyTrajectory(Trajectory trajectory)
        {
            VerifyAllowedValues(trajectory.AziRef, new List<string> { "grid north", "magnetic north", "true north", "unknown" }, nameof(trajectory.AziRef));
            VerifyAllowedValues(trajectory.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }

        private static void VerifyWbGeometry(WbGeometry wbGeometry)
        {
            VerifyMeasure(wbGeometry.MdBottom, nameof(wbGeometry.MdBottom));
            VerifyMeasure(wbGeometry.GapAir, nameof(wbGeometry.GapAir));
            VerifyMeasure(wbGeometry.DepthWaterMean, nameof(wbGeometry.DepthWaterMean));
            VerifyAllowedValues(wbGeometry.CommonData?.ItemState, _allowedItemStates, "CommonData.ItemState");
        }
    }
}
