
namespace WitsmlExplorer.Api.Models
{
    public class ObjectSearchResult : ObjectOnWellbore
    {
        public string SearchProperty { get; set; }
        public EntityType ObjectType { get; set; }
    }
}
