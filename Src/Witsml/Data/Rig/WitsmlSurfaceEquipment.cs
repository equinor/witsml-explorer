using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlSurfaceEquipment
    {
        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("presRating")]
        public WitsmlPressureMeasure PresRating { get; set; }

        [XmlElement("typeSurfEquip")]
        public string TypeSurfEquip { get; set; }

        [XmlElement("usePumpDischarge")]
        public string UsePumpDischarge { get; set; }

        [XmlElement("useStandpipe")]
        public string UseStandpipe { get; set; }

        [XmlElement("useHose")]
        public string UseHose { get; set; }

        [XmlElement("useSwivel")]
        public string UseSwivel { get; set; }

        [XmlElement("useKelly")]
        public string UseKelly { get; set; }

        [XmlElement("useTopStack")]
        public string UseTopStack { get; set; }

        [XmlElement("useInjStack")]
        public string UseInjStack { get; set; }

        [XmlElement("useSurfaceIron")]
        public string UseSurfaceIron { get; set; }

        [XmlElement("idStandpipe")]
        public WitsmlLengthMeasure IdStandpipe { get; set; }

        [XmlElement("lenStandpipe")]
        public WitsmlLengthMeasure LenStandpipe { get; set; }

        [XmlElement("idHose")]
        public WitsmlLengthMeasure IdHose { get; set; }

        [XmlElement("lenHose")]
        public WitsmlLengthMeasure LenHose { get; set; }

        [XmlElement("idSwivel")]
        public WitsmlLengthMeasure IdSwivel { get; set; }

        [XmlElement("lenSwivel")]
        public WitsmlLengthMeasure LenSwivel { get; set; }

        [XmlElement("idKelly")]
        public WitsmlLengthMeasure IdKelly { get; set; }

        [XmlElement("lenKelly")]
        public WitsmlLengthMeasure LenKelly { get; set; }

        [XmlElement("idSurfaceIron")]
        public WitsmlLengthMeasure IdSurfaceIron { get; set; }

        [XmlElement("lenSurfaceIron")]
        public WitsmlLengthMeasure LenSurfaceIron { get; set; }

        [XmlElement("htSurfaceIron")]
        public WitsmlLengthMeasure HtSurfaceIron { get; set; }

        [XmlElement("idDischargeLine")]
        public WitsmlLengthMeasure IdDischargeLine { get; set; }

        [XmlElement("lenDischargeLine")]
        public WitsmlLengthMeasure LenDischargeLine { get; set; }

        [XmlElement("ctWrapType")]
        public string CtWrapType { get; set; }

        [XmlElement("odReel")]
        public WitsmlLengthMeasure OdReel { get; set; }

        [XmlElement("odCore")]
        public WitsmlLengthMeasure OdCore { get; set; }

        [XmlElement("widReelWrap")]
        public WitsmlLengthMeasure WidReelWrap { get; set; }

        [XmlElement("lenReel")]
        public WitsmlLengthMeasure LenReel { get; set; }

        [XmlElement("injStkUp")]
        public string InjStkUp { get; set; }

        [XmlElement("htInjStk")]
        public WitsmlLengthMeasure HtInjStk { get; set; }

        [XmlElement("umbInside")]
        public string UmbInside { get; set; }

        [XmlElement("odUmbilical")]
        public WitsmlLengthMeasure OdUmbilical { get; set; }

        [XmlElement("lenUmbilical")]
        public WitsmlLengthMeasure LenUmbilical { get; set; }

        [XmlElement("idTopStk")]
        public WitsmlLengthMeasure IdTopStk { get; set; }

        [XmlElement("htTopStk")]
        public WitsmlLengthMeasure HtTopStk { get; set; }

        [XmlElement("htFlange")]
        public WitsmlLengthMeasure HtFlange { get; set; }
    }
}
