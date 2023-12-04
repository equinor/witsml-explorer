using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlWbGeometry : WitsmlObjectOnWellbore
    {
        public override WitsmlWbGeometrys AsItemInWitsmlList()
        {
            return new WitsmlWbGeometrys()
            {
                WbGeometrys = this.AsItemInList()
            };
        }

        [XmlElement("dTimReport")]
        public string DTimReport { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasuredDepthCoord MdBottom { get; set; }

        [XmlElement("gapAir")]
        public WitsmlLengthMeasure GapAir { get; set; }

        [XmlElement("depthWaterMean")]
        public WitsmlLengthMeasure DepthWaterMean { get; set; }

        [XmlElement("wbGeometrySection")]
        public List<WitsmlWbGeometrySection> WbGeometrySections { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
