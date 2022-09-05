using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlDrillingParams
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("eTimOpBit")]
        public Measure ETimOpBit { get; set; }

        [XmlElement("mdHoleStart")]
        public WitsmlMeasuredDepthCoord MdHoleStart { get; set; }

        [XmlElement("mdHoleStop")]
        public WitsmlMeasuredDepthCoord MdHoleStop { get; set; }

        [XmlElement("tubular")]
        public WitsmlRefNameString Tubular { get; set; }

        [XmlElement("hkldRot")]
        public Measure HkldRot { get; set; }

        [XmlElement("overPull")]
        public Measure OverPull { get; set; }

        [XmlElement("slackOff")]
        public Measure SlackOff { get; set; }

        [XmlElement("hkldUp")]
        public Measure HkldUp { get; set; }

        [XmlElement("hkldDn")]
        public Measure HkldDn { get; set; }

        [XmlElement("tqOnBotAv")]
        public Measure TqOnBotAv { get; set; }

        [XmlElement("tqOnBotMx")]
        public Measure TqOnBotMx { get; set; }

        [XmlElement("tqOnBotMn")]
        public Measure TqOnBotMn { get; set; }

        [XmlElement("tqOffBotAv")]
        public Measure TqOffBotAv { get; set; }

        [XmlElement("tqDhAv")]
        public Measure TqDhAv { get; set; }

        [XmlElement("wtAboveJar")]
        public Measure WtAboveJar { get; set; }

        [XmlElement("wtBelowJar")]
        public Measure WtBelowJar { get; set; }

        [XmlElement("wtMud")]
        public Measure WtMud { get; set; }

        [XmlElement("flowratePump")]
        public Measure FlowratePump { get; set; }

        [XmlElement("powBit")]
        public Measure PowBit { get; set; }

        [XmlElement("velNozzleAv")]
        public Measure VelNozzleAv { get; set; }

        [XmlElement("presDropBit")]
        public Measure PresDropBit { get; set; }

        [XmlElement("cTimHold")]
        public Measure CTimHold { get; set; }

        [XmlElement("cTimSteering")]
        public Measure CTimSteering { get; set; }

        [XmlElement("cTimDrillRot")]
        public Measure CTimDrillRot { get; set; }

        [XmlElement("cTimDrillSlid")]
        public Measure CTimDrillSlid { get; set; }

        [XmlElement("cTimCirc")]
        public Measure CTimCirc { get; set; }

        [XmlElement("cTimReam")]
        public Measure CTimReam { get; set; }

        [XmlElement("distDrillRot")]
        public Measure DistDrillRot { get; set; }

        [XmlElement("distDrillSlid")]
        public Measure DistDrillSlid { get; set; }

        [XmlElement("distReam")]
        public Measure DistReam { get; set; }

        [XmlElement("distHold")]
        public Measure DistHold { get; set; }

        [XmlElement("distSteering")]
        public Measure DistSteering { get; set; }

        [XmlElement("rpmAv")]
        public Measure RpmAv { get; set; }

        [XmlElement("rpmMx")]
        public Measure RpmMx { get; set; }

        [XmlElement("rpmMn")]
        public Measure RpmMn { get; set; }

        [XmlElement("rpmAvDh")]
        public Measure RpmAvDh { get; set; }

        [XmlElement("ropAv")]
        public Measure RopAv { get; set; }

        [XmlElement("ropMx")]
        public Measure RopMx { get; set; }

        [XmlElement("ropMn")]
        public Measure RopMn { get; set; }

        [XmlElement("wobAv")]
        public Measure WobAv { get; set; }

        [XmlElement("wobMx")]
        public Measure WobMx { get; set; }

        [XmlElement("wobMn")]
        public Measure WobMn { get; set; }

        [XmlElement("wobAvDh")]
        public Measure WobAvDh { get; set; }

        [XmlElement("reasonTrip")]
        public string ReasonTrip { get; set; }

        [XmlElement("objectiveBha")]
        public string ObjectiveBha { get; set; }

        [XmlElement("aziTop")]
        public Measure AziTop { get; set; }

        [XmlElement("aziBottom")]
        public Measure AziBottom { get; set; }

        [XmlElement("inclStart")]
        public Measure InclStart { get; set; }

        [XmlElement("inclMx")]
        public Measure InclMx { get; set; }

        [XmlElement("inclMn")]
        public Measure InclMn { get; set; }

        [XmlElement("inclStop")]
        public Measure InclStop { get; set; }

        [XmlElement("tempMudDhMx")]
        public Measure TempMudDhMx { get; set; }

        [XmlElement("presPumpAv")]
        public Measure PresPumpAv { get; set; }

        [XmlElement("flowrateBit")]
        public Measure FlowrateBit { get; set; }

        [XmlElement("mudClass")]
        public string MudClass { get; set; }

        [XmlElement("mudSubClass")]
        public string MudSubClass { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }

    }
}
