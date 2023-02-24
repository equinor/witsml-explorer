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
        Log,
        Message,
        MudLog,
        Rig,
        Risk,
        Tubular,
        Trajectory,
        WbGeometry,
    }

    public class EntityTypeHelper
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

        public static Witsml.Data.ObjectOnWellbore EntityTypeToObjectOnWellbore(EntityType type)
        {
            return type switch
            {
                EntityType.BhaRun => new WitsmlBhaRun(),
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
    }
}
