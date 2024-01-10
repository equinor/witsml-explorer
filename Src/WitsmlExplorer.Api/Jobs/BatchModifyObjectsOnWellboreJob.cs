using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record BatchModifyObjectsOnWellboreJob : Job
    {
        [JsonConverter(typeof(ObjectOnWellboreListConverter))]
        public List<ObjectOnWellbore> Objects { get; init; }
        public EntityType ObjectType { get; init; }

        public override string Description()
        {
            return $"To Batch Modify - Type: {ObjectType}, Uids: {string.Join(", ", Objects.Select(o => o.Uid))}.";
        }

        public override string GetObjectName()
        {
            return string.Join(", ", Objects.Select(o => o.Name));
        }

        public override string GetWellboreName()
        {
            return string.Join(", ", Objects.Select(o => o.WellboreName).Distinct());
        }

        public override string GetWellName()
        {
            return string.Join(", ", Objects.Select(o => o.WellName).Distinct());
        }
    }
}
