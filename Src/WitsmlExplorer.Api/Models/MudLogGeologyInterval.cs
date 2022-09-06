using System;
using System.Collections.Generic;

using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogGeologyInterval
    {
        public string Uid { get; set; }
        public string TypeLithology { get; set; }
        public string MdTop { get; set; }
        public string MdBottom { get; set; }
        public MudLogLithology Lithology { get; set; }
        public CommonTime CommonTime { get; set; }
    }
}
