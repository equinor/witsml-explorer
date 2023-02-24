using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlFormationMarker : ObjectOnWellbore
    {
        public override WitsmlFormationMarkers AsSingletonWitsmlList()
        {
            return new WitsmlFormationMarkers()
            {
                FormationMarkers = this.AsSingletonList()
            };
        }

        [XmlElement("description")]
        public string Description { get; init; }

        [XmlElement("mdPrognosed")]
        public WitsmlMeasuredDepthCoord MdPrognosed { get; init; }

        [XmlElement("tvdPrognosed")]
        public WitsmlWellVerticalDepthCoord TvdPrognosed { get; init; }

        [XmlElement("mdTopSample")]
        public WitsmlMeasuredDepthCoord MdTopSample { get; init; }

        [XmlElement("tvdTopSample")]
        public WitsmlWellVerticalDepthCoord TvdTopSample { get; init; }

        [XmlElement("thicknessBed")]
        public WitsmlLengthMeasure ThicknessBed { get; init; }

        [XmlElement("thicknessApparent")]
        public WitsmlLengthMeasure ThicknessApparent { get; init; }

        [XmlElement("thicknessPerpen")]
        public WitsmlLengthMeasure ThicknessPerpen { get; init; }

        [XmlElement("mdLogSample")]
        public WitsmlMeasuredDepthCoord MdLogSample { get; init; }

        [XmlElement("tvdLogSample")]
        public WitsmlWellVerticalDepthCoord TvdLogSample { get; init; }

        [XmlElement("dip")]
        public WitsmlPlaneAngleMeasure Dip { get; init; }

        [XmlElement("dipDirection")]
        public WitsmlPlaneAngleMeasure DipDirection { get; init; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; init; }
    }
}
