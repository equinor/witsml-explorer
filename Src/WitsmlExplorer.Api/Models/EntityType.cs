using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

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
    }
}
