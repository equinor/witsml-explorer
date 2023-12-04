using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data.MudLog
{
    public class WitsmlMudLog : WitsmlObjectOnWellbore
    {
        public override WitsmlMudLogs AsItemInWitsmlList()
        {
            return new WitsmlMudLogs()
            {
                MudLogs = this.AsItemInList()
            };
        }

        [XmlElement("objectGrowing")]
        public string ObjectGrowing { get; set; }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("mudLogCompany")]
        public string MudLogCompany { get; set; }

        [XmlElement("mudLogEngineers")]
        public string MudLogEngineers { get; set; }

        [XmlElement("startMd")]
        public WitsmlMeasureWithDatum StartMd { get; set; }

        [XmlElement("endMd")]
        public WitsmlMeasureWithDatum EndMd { get; set; }

        [XmlElement("relatedLog")]
        public List<string> RelatedLog { get; set; }

        [XmlElement("parameter")]
        public List<WitsmlMudLogParameter> MudLogParameters { get; set; }

        [XmlElement("geologyInterval")]
        public List<WitsmlMudLogGeologyInterval> GeologyInterval { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
