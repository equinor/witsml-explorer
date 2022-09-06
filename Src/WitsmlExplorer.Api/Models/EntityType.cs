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
        MessageObjects,
        Rigs,
        Risks,
        Tubular,
        Trajectories,
        Trajectory,
        TrajectoryStation,
        WbGeometryObjects
    }
}
