using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlMudLog : ObjectOnWellbore<WitsmlMudLogs>
    {
        public override WitsmlMudLogs AsSingletonWitsmlList()
        {
            return new WitsmlMudLogs()
            {
                MudLogs = this.AsSingletonList()
            };
        }

        [XmlElement("objectGrowing")]
        public string ObjectGrowing { get; set; }

        [XmlElement("mudLogCompany")]
        public string MudLogCompany { get; set; }

        [XmlElement("mudLogEngineers")]
        public string MudLogEngineers { get; set; }

        [XmlElement("startMd")]
        public WitsmlIndex StartMd { get; set; }

        [XmlElement("endMd")]
        public WitsmlIndex EndMd { get; set; }

        [XmlElement("geologyInterval")]
        public List<WitsmlMudLogGeologyInterval> GeologyInterval { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
