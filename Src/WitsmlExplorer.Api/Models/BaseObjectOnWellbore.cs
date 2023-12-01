using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class BaseObjectOnWellbore : ObjectOnWellbore
    {
        public override IWitsmlQueryType ToWitsml()
        {
            throw new System.NotImplementedException("BaseObjectOnWellbore is not supposed to be converted to a WITSML model");
        }
    }
}
