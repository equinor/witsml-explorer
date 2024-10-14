using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateObjectOnWellboreJob : Job
    {
        [JsonConverter(typeof(ObjectOnWellboreConverter))]
        public ObjectOnWellbore Object { get; init; }
        public EntityType ObjectType { get; init; }

        public override string Description()
        {
            return $"To Create - Type: {ObjectType}, Uid: {Object.Uid}.";
        }

        public override string GetObjectName()
        {
            return Object.Name;
        }

        public override string GetWellboreName()
        {
            return Object.WellboreName;
        }

        public override string GetWellName()
        {
            return Object.WellName;
        }
    }
}
