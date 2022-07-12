using System.Text;
using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyTubularJob : ICopyJob<TubularReferences, WellboreReference>
    {
    }
}
