using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlShortNameStruct
    {
        [XmlAttribute("namingSystem")]
        public string NamingSystem { get; set; }

        [XmlText]
        public string Value { get; set; }
    }

    public class WitsmlLogCurveInfo : IWitsmlQueryType
    {
        public static readonly string LogDataTypeDouble = "double";
        public static readonly string LogDataTypeDatetime = "date time";

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("mnemonic")]
        public WitsmlShortNameStruct MnemonicObject { get; set; }

        [XmlIgnore]
        public string Mnemonic
        {
            get => MnemonicObject?.Value;
            set
            {
                if (value == null && MnemonicObject?.NamingSystem == null)
                {
                    MnemonicObject = null;
                }
                else
                {
                    MnemonicObject ??= new WitsmlShortNameStruct();
                    MnemonicObject.Value = value;
                }
            }
        }

        [XmlIgnore]
        public string MnemonicNamingSystem
        {
            get => MnemonicObject?.NamingSystem;
            set
            {
                if (value == null && MnemonicObject?.Value == null)
                {
                    MnemonicObject = null;
                }
                else
                {
                    MnemonicObject ??= new WitsmlShortNameStruct();
                    MnemonicObject.NamingSystem = value;
                }
            }
        }

        [XmlElement("classWitsml")]
        public string ClassWitsml { get; set; }

        [XmlElement("classIndex")]
        public string ClassIndex { get; set; }

        [XmlElement("unit")]
        public string Unit { get; set; }

        [XmlElement("mnemAlias")]
        public WitsmlShortNameStruct MnemAliasObject { get; set; }

        [XmlIgnore]
        public string MnemAlias
        {
            get => MnemAliasObject?.Value;
            set
            {
                if (value == null && MnemAliasObject?.NamingSystem == null)
                {
                    MnemAliasObject = null;
                }
                else
                {
                    MnemAliasObject ??= new WitsmlShortNameStruct();
                    MnemAliasObject.Value = value;
                }
            }
        }

        [XmlIgnore]
        public string MnemAliasNamingSystem
        {
            get => MnemAliasObject?.NamingSystem;
            set
            {
                if (value == null && MnemAliasObject?.Value == null)
                {
                    MnemAliasObject = null;
                }
                else
                {
                    MnemAliasObject ??= new WitsmlShortNameStruct();
                    MnemAliasObject.NamingSystem = value;
                }
            }
        }

        [XmlElement("nullValue")]
        public string NullValue { get; set; }

        [XmlElement("alternateIndex")]
        public string AlternateIndex { get; set; }

        [XmlElement("wellDatum")]
        public WitsmlRefNameString WellDatumRef { get; set; }

        [XmlIgnore]
        public string WellDatum
        {
            get => WellDatumRef?.Value;
            set
            {
                if (value == null && WellDatumRef?.UidRef == null)
                {
                    WellDatumRef = null;
                }
                else
                {
                    WellDatumRef ??= new WitsmlRefNameString();
                    WellDatumRef.Value = value;
                }
            }
        }

        [XmlIgnore]
        public string WellDatumUidRef
        {
            get => WellDatumRef?.UidRef;
            set
            {
                if (value == null && WellDatumRef?.Value == null)
                {
                    WellDatumRef = null;
                }
                else
                {
                    WellDatumRef ??= new WitsmlRefNameString();
                    WellDatumRef.UidRef = value;
                }
            }
        }

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
        public WitsmlPerLengthMeasure DensData { get; set; }

        [XmlElement("traceState")]
        public string TraceState { get; set; }

        [XmlElement("traceOrigin")]
        public string TraceOrigin { get; set; }

        [XmlElement("typeLogData")]
        public string TypeLogData { get; set; }

        [XmlElement("axisDefinition")]
        public List<WitsmlAxisDefinition> AxisDefinitions { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }

        public string TypeName => "logCurveInfo";

        public static WitsmlLogCurveInfo Query(string mnemonic)
        {
            return new WitsmlLogCurveInfo { Mnemonic = mnemonic };
        }
    }
}
