

using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class BaseObjectOnWellbore : ObjectOnWellbore
    {
        public override IWitsmlQueryType ToWitsml()
        {
            return null;
        }
    }
}
