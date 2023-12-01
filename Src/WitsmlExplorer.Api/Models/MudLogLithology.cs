using Witsml.Data.MudLog;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogLithology
    {
        public string Uid { get; init; }
        public string Type { get; init; }
        public string CodeLith { get; init; }
        public string LithPc { get; init; }
    }

    public static class MudLogLithologyExtensions
    {
        public static WitsmlMudLogLithology ToWitsml(this MudLogLithology mudLogLithology)
        {
            return new WitsmlMudLogLithology
            {
                Uid = mudLogLithology.Uid,
                Type = mudLogLithology.Type,
                CodeLith = mudLogLithology.CodeLith,
                LithPc = mudLogLithology.LithPc != null ? new Witsml.Data.WitsmlIndex(mudLogLithology.LithPc) : null
            };
        }
    }
}
