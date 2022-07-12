using System.Text;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyTubularComponentsJob : ICopyJob<TubularComponentReferences, TubularReference>
    {
    }
}
