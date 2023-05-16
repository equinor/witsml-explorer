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
        WbGeometrySection
    }


    public static class ComponentTypeHelper
    {
        public static string ToPluralLowercase(ComponentType componentType)
        {
            string lower = componentType.ToString().ToLowerInvariant();
            return lower.Last() == 'y' ? lower.Remove(lower.Length - 1) + "ies" : lower + "s";
        }
    }
}
