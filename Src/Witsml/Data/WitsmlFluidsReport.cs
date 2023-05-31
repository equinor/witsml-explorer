using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlFluidsReport : WitsmlObjectOnWellbore
    {
        public override WitsmlFluidsReports AsSingletonWitsmlList()
        {
            return new WitsmlFluidsReports()
            {
                FluidsReports = this.AsSingletonList()
            };
        }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("md")]
        public WitsmlMeasuredDepthCoord Md { get; set; }

        [XmlElement("tvd")]
        public WitsmlWellVerticalDepthCoord Tvd { get; set; }

        [XmlElement("numReport")]
        public string NumReport { get; set; }

        [XmlElement("fluid")]
        public List<WitsmlFluid> Fluid { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
