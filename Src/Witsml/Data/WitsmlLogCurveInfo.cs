using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlLogCurveInfo : IWitsmlQueryType
    {
        public static readonly string LogDataTypeDouble = "double";
        public static readonly string LogDataTypeDatetime = "date time";

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("mnemonic")]
        public string Mnemonic { get; set; }

        [XmlElement("classWitsml")]
        public string ClassWitsml { get; set; }

        [XmlElement("classIndex")]
        public string ClassIndex { get; set; }

        [XmlElement("unit")]
        public string Unit { get; set; }

        [XmlElement("mnemAlias")]
        public string MnemAlias { get; set; }

        [XmlElement("nullValue")]
        public string NullValue { get; set; }

        [XmlElement("alternateIndex")]
        public string AlternateIndex { get; set; }

        [XmlElement("wellDatum")]
        public string WellDatum { get; set; }

        [XmlElement("minIndex")]
        public WitsmlIndex MinIndex { get; set; }

        [XmlElement("maxIndex")]
        public WitsmlIndex MaxIndex { get; set; }

        [XmlElement("minDateTimeIndex")]
        public string MinDateTimeIndex { get; set; }

        [XmlElement("maxDateTimeIndex")]
        public string MaxDateTimeIndex { get; set; }

        [XmlElement("curveDescription")]
        public string CurveDescription { get; set; }

        [XmlElement("sensorOffset")]
        public WitsmlLengthMeasure SensorOffset { get; set; }

        [XmlElement("dataSource")]
        public string DataSource { get; set; }

        [XmlElement("densData")]
        public string DensData { get; set; }

        [XmlElement("traceState")]
        public string TraceState { get; set; }

        [XmlElement("traceOrigin")]
        public string TraceOrigin { get; set; }

        [XmlElement("typeLogData")]
        public string TypeLogData { get; set; }

        [XmlElement("axisDefinition")]
        public List<WitsmlAxisDefinition> AxisDefinitions { get; set; }

        public string TypeName => "logCurveInfo";

        public static WitsmlLogCurveInfo Query(string mnemonic)
        {
            return new WitsmlLogCurveInfo { Mnemonic = mnemonic };
        }
    }
}
