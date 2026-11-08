using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlTimestampedTimeZone
    {
        [XmlAttribute("dTim")]
        public string DTim { get; set; }

        [XmlText]
        public string Value { get; set; }
    }

    [XmlRoot]
    public class WitsmlCommonData
    {
        [XmlElement("sourceName")]
        public string SourceName { get; set; }

        [XmlElement("dTimCreation")]
        public string DTimCreation { get; set; }

        [XmlElement("dTimLastChange")]
        public string DTimLastChange { get; set; }

        [XmlElement("itemState")]
        public string ItemState { get; set; }

        [XmlElement("serviceCategory")]
        public string ServiceCategory { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }

        [XmlIgnore]
        public string AcquisitionTimeZone
        {
            get => AcquisitionTimeZoneObject?.Value;
            set
            {
                if (value == null && AcquisitionTimeZoneObject == null) return;
                if (value == null)
                {
                    AcquisitionTimeZoneObject = null;
                    return;
                }
                AcquisitionTimeZoneObject ??= new WitsmlTimestampedTimeZone();
                AcquisitionTimeZoneObject.Value = value;
            }
        }

        [XmlElement("acquisitionTimeZone")]
        public WitsmlTimestampedTimeZone AcquisitionTimeZoneObject { get; set; }

        [XmlIgnore]
        public string DefaultDatum
        {
            get => DefaultDatumRef?.Value;
            set
            {
                if (value == null && DefaultDatumRef == null) return;
                if (value == null)
                {
                    DefaultDatumRef = null;
                    return;
                }
                DefaultDatumRef ??= new WitsmlRefNameString();
                DefaultDatumRef.Value = value;
            }
        }

        [XmlElement("defaultDatum")]
        public WitsmlRefNameString DefaultDatumRef { get; set; }

        [XmlElement("privateGroupOnly")]
        public string PrivateGroupOnly { get; set; }

        [XmlElement("extensionAny")]
        public WitsmlCustomData ExtensionAny { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
    }
}
