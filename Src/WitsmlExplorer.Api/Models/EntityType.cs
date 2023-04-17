using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.Data.Rig;
using Witsml.Data.Tubular;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EntityType
    {
        Well,
        Wellbore,
        BhaRun,
        FormationMarker,
        Log,
        Message,
        MudLog,
        Rig,
        Risk,
        Tubular,
        Trajectory,
        WbGeometry,
    }

    public static class EntityTypeHelper
    {
        public static Dictionary<EntityType, string> EntityTypeToPluralLowercase()
        {
            return Enum.GetValues(typeof(EntityType))
               .Cast<EntityType>()
               .ToDictionary(
                entityType => entityType,
               entityType =>
               {
                   string lower = entityType.ToString().ToLowerInvariant();
                   return lower.Last() == 'y' ? lower.Remove(lower.Length - 1) + "ies" : lower + "s";
               });
        }

        public static WitsmlObjectOnWellbore EntityTypeToObjectOnWellbore(EntityType type)
        {
            return type switch
            {
                EntityType.BhaRun => new WitsmlBhaRun(),
                EntityType.FormationMarker => new WitsmlFormationMarker(),
                EntityType.Log => new WitsmlLog(),
                EntityType.Message => new WitsmlMessage(),
                EntityType.MudLog => new WitsmlMudLog(),
                EntityType.Rig => new WitsmlRig(),
                EntityType.Risk => new WitsmlRisk(),
                EntityType.Tubular => new WitsmlTubular(),
                EntityType.Trajectory => new WitsmlTrajectory(),
                EntityType.WbGeometry => new WitsmlWbGeometry(),
                EntityType.Well => null,
                EntityType.Wellbore => null,
                _ => null,
            };
        }

        public static IWitsmlObjectList EntityTypeToObjectList(EntityType type)
        {
            return type switch
            {
                EntityType.BhaRun => new WitsmlBhaRuns(),
                EntityType.FormationMarker => new WitsmlFormationMarkers(),
                EntityType.Log => new WitsmlLogs(),
                EntityType.Message => new WitsmlMessages(),
                EntityType.MudLog => new WitsmlMudLogs(),
                EntityType.Rig => new WitsmlRigs(),
                EntityType.Risk => new WitsmlRisks(),
                EntityType.Tubular => new WitsmlTubulars(),
                EntityType.Trajectory => new WitsmlTrajectories(),
                EntityType.WbGeometry => new WitsmlWbGeometrys(),
                EntityType.Well => null,
                EntityType.Wellbore => null,
                _ => null,
            };
        }
    }
}
