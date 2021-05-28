using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WitsmlExplorer.Api.Models
{
    public class FormationMarker
    {

        public string UidWell { get; set; }
        public string UidWellbore { get; set; }
        public string Uid { get; set; }
        public string NameWell { get; set; }
        public string NameWellbore { get; set; }
        public string NameFormation { get; set; }
        public string Description { get; set; }
        public string TvdTopSample { get; set; }
        public string MdTopSample { get; set; }
        public CommonData CommonData { get; set; }
    }
}
