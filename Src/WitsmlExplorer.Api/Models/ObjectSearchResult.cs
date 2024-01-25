using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class ObjectSearchResult : ObjectOnWellbore
    {
        public string SearchProperty { get; set; }
        public EntityType ObjectType { get; set; }

        public override IWitsmlQueryType ToWitsml()
        {
            throw new System.NotImplementedException("ObjectSearchResult is not supposed to be converted to a WITSML model");
        }
    }
}
