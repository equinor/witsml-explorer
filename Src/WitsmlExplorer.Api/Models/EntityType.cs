using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EntityType
    {
        Well,
        Wellbore,
        BhaRun,
        LogObject,
        Message,
        MudLog,
        Rig,
        Risk,
        Tubular,
        Trajectory,
        WbGeometry,
    }
}
