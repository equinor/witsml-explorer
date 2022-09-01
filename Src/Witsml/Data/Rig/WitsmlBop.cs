
using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlBop
    {
        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }


        [XmlElement("model")]
        public string Model { get; set; }


        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }


        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }


        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }


        [XmlElement("typeConnectionBop")]
        public string TypeConnectionBop { get; set; }


        [XmlElement("sizeConnectionBop")]
        public WitsmlLengthMeasure SizeConnectionBop { get; set; }


        [XmlElement("presBopRating")]
        public WitsmlPressureMeasure PresBopRating { get; set; }


        [XmlElement("sizeBopSys")]
        public WitsmlLengthMeasure SizeBopSys { get; set; }


        [XmlElement("rotBop")]
        public string RotBop { get; set; }


        [XmlElement("idBoosterLine")]
        public WitsmlLengthMeasure IdBoosterLine { get; set; }


        [XmlElement("odBoosterLine")]
        public WitsmlLengthMeasure OdBoosterLine { get; set; }


        [XmlElement("lenBoosterLine")]
        public WitsmlLengthMeasure LenBoosterLine { get; set; }


        [XmlElement("idSurfLine")]
        public WitsmlLengthMeasure IdSurfLine { get; set; }


        [XmlElement("odSurfLine")]
        public WitsmlLengthMeasure OdSurfLine { get; set; }


        [XmlElement("lenSurfLine")]
        public WitsmlLengthMeasure LenSurfLine { get; set; }


        [XmlElement("idChkLine")]
        public WitsmlLengthMeasure IdChkLine { get; set; }


        [XmlElement("odChkLine")]
        public WitsmlLengthMeasure OdChkLine { get; set; }


        [XmlElement("lenChkLine")]
        public WitsmlLengthMeasure LenChkLine { get; set; }


        [XmlElement("idKillLine")]
        public WitsmlLengthMeasure IdKillLine { get; set; }


        [XmlElement("odKillLine")]
        public WitsmlLengthMeasure OdKillLine { get; set; }


        [XmlElement("lenKillLine")]
        public WitsmlLengthMeasure LenKillLine { get; set; }


        [XmlElement("bopComponent")]
        public List<WitsmlBopComponent> BopComponent { get; set; }


        [XmlElement("typeDiverter")]
        public string TypeDiverter { get; set; }


        [XmlElement("diaDiverter")]
        public WitsmlLengthMeasure DiaDiverter { get; set; }


        [XmlElement("presWorkDiverter")]
        public WitsmlPressureMeasure PresWorkDiverter { get; set; }


        [XmlElement("accumulator")]
        public string Accumulator { get; set; }


        [XmlElement("capAccFluid")]
        public WitsmlVolumeMeasure CapAccFluid { get; set; }


        [XmlElement("presAccPreCharge")]
        public WitsmlPressureMeasure PresAccPreCharge { get; set; }


        [XmlElement("volAccPreCharge")]
        public WitsmlVolumeMeasure VolAccPreCharge { get; set; }


        [XmlElement("presAccOpRating")]
        public WitsmlPressureMeasure PresAccOpRating { get; set; }


        [XmlElement("typeControlManifold")]
        public string TypeControlManifold { get; set; }


        [XmlElement("descControlManifold")]
        public string DescControlManifold { get; set; }


        [XmlElement("typeChokeManifold")]
        public string TypeChokeManifold { get; set; }


        [XmlElement("presChokeManifold")]
        public WitsmlPressureMeasure PresChokeManifold { get; set; }
    }
}
