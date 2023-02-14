using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogGeologyInterval
    {
        public string Uid { get; set; }
        public string TypeLithology { get; set; }
        public string MdTop { get; set; }
        public string MdBottom { get; set; }
        public List<MudLogLithology> Lithologies { get; set; }
        public CommonTime CommonTime { get; set; }
    }
}
