using System;
using System.Linq;
using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ComponentType
    {
        GeologyInterval,
        Mnemonic,
        TrajectoryStation,
        TubularComponent,
        WbGeometrySection,
        Fluid
    }

    public static class ComponentTypeExtensions
    {
        public static string ToPluralLowercase(this ComponentType componentType)
        {
            string lower = componentType.ToString().ToLowerInvariant();
            return lower.Last() == 'y' ? lower.Remove(lower.Length - 1) + "ies" : lower + "s";
        }

        public static EntityType ToParentType(this ComponentType componentType)
        {
            return componentType switch
            {
                ComponentType.GeologyInterval => EntityType.MudLog,
                ComponentType.Mnemonic => EntityType.Log,
                ComponentType.TrajectoryStation => EntityType.Trajectory,
                ComponentType.TubularComponent => EntityType.Tubular,
                ComponentType.WbGeometrySection => EntityType.WbGeometry,
                ComponentType.Fluid => EntityType.FluidsReport,
                _ => throw new ArgumentException($"Invalid component type {componentType}"),
            };
        }
    }
}
