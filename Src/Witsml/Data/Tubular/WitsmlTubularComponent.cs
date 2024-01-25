using System.Collections.Generic;
using System.Globalization;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlTubularComponent
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeTubularComp")]
        public string TypeTubularComp { get; set; }

        [XmlIgnore]
        public int? Sequence { get; set; }
        [XmlElement("sequence")]
        public string SequenceText
        {
            get => Sequence?.ToString(CultureInfo.InvariantCulture);
            set => Sequence = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value);
        }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("id")]
        public WitsmlLengthMeasure Id { get; set; }

        [XmlElement("od")]
        public WitsmlLengthMeasure Od { get; set; }

        [XmlElement("odMx")]
        public Measure OdMx { get; set; }

        [XmlElement("len")]
        public WitsmlLengthMeasure Len { get; set; }

        [XmlElement("lenJointAv")]
        public Measure LenJointAv { get; set; }

        [XmlIgnore]
        public int? NumJointStand { get; set; }
        [XmlElement("numJointStand")]
        public string NumJointStandText
        {
            get => NumJointStand?.ToString(CultureInfo.InvariantCulture);
            set => NumJointStand = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value);
        }

        [XmlElement("wtPerLen")]
        public Measure WtPerLen { get; set; }

        [XmlElement("grade")]
        public string Grade { get; set; }

        [XmlElement("odDrift")]
        public Measure OdDrift { get; set; }

        [XmlElement("tensYield")]
        public Measure TensYield { get; set; }

        [XmlElement("tqYield")]
        public Measure TqYield { get; set; }

        [XmlElement("stressFatig")]
        public Measure StressFatig { get; set; }

        [XmlElement("lenFishneck")]
        public Measure LenFishneck { get; set; }

        [XmlElement("idFishneck")]
        public Measure IdFishneck { get; set; }

        [XmlElement("odFishneck")]
        public Measure OdFishneck { get; set; }

        [XmlElement("disp")]
        public Measure Disp { get; set; }

        [XmlElement("presBurst")]
        public Measure PresBurst { get; set; }

        [XmlElement("presCollapse")]
        public Measure PresCollapse { get; set; }

        [XmlElement("classService")]
        public string ClassService { get; set; }

        [XmlElement("wearWall")]
        public Measure WearWall { get; set; }

        [XmlElement("thickWall")]
        public Measure ThickWall { get; set; }

        [XmlElement("configCon")]
        public string ConfigCon { get; set; }

        [XmlElement("bendStiffness")]
        public Measure BendStiffness { get; set; }

        [XmlElement("axialStiffness")]
        public Measure AxialStiffness { get; set; }

        [XmlElement("torsionalStiffness")]
        public Measure TorsionalStiffness { get; set; }

        [XmlElement("typeMaterial")]
        public string TypeMaterial { get; set; }

        [XmlElement("doglegMx")]
        public Measure DoglegMx { get; set; }

        [XmlElement("vendor")]
        public string Vendor { get; set; }

        [XmlElement("model")]
        public string Model { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }

        [XmlElement("bitRecord")]
        public WitsmlBitRecord BitRecord { get; set; }

        [XmlElement("areaNozzleFlow")]
        public Measure AreaNozzleFlow { get; set; }

        [XmlElement("nozzle")]
        public List<WitsmlNozzle> Nozzle { get; set; }

        [XmlElement("connection")]
        public List<WitsmlConnection> Connection { get; set; }

        [XmlElement("jar")]
        public WitsmlJar Jar { get; set; }

        [XmlElement("mwdTool")]
        public WitsmlMwdTool MwdTool { get; set; }

        [XmlElement("motor")]
        public WitsmlMotor Motor { get; set; }

        [XmlElement("stabilizer")]
        public List<WitsmlStabilizer> Stabilizer { get; set; }

        [XmlElement("bend")]
        public List<WitsmlBend> Bend { get; set; }

        [XmlElement("holeOpener")]
        public WitsmlHoleOpener HoleOpener { get; set; }

        [XmlElement("rotarySteerableTool")]
        public WitsmlRotarySteerableTool RotarySteerableTool { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
