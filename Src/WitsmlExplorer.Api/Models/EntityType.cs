using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum EntityType
    {
        Well,
        Wellbore,
        BhaRuns,
        LogObject,
        LogObjects,
        Messages,
        MudLogs,
        Rigs,
        Risks,
        Tubular,
        Tubulars,
        Trajectories,
        Trajectory,
        WbGeometry,
        WbGeometries,
    }
}
