using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyMessageObjectJob
    {
        public MessageObject MessageObject { get; init; }
    }
}
