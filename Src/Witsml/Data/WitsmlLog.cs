using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlLog : WitsmlObjectOnWellbore
    {
        public override WitsmlLogs AsItemInWitsmlList()
        {
            return new WitsmlLogs()
            {
                Logs = this.AsItemInList()
            };
        }

        public const string WITSML_INDEX_TYPE_MD = "measured depth";
        public const string WITSML_INDEX_TYPE_DATE_TIME = "date time";
        public const string WITSML_DIRECTION_INCREASING = "increasing";
        public const string WITSML_DIRECTION_DECREASING = "decreasing";

        [XmlElement("objectGrowing")]
        public string ObjectGrowing { get; set; }

        [XmlElement("serviceCompany")]
        public string ServiceCompany { get; set; }

        [XmlElement("runNumber")]
        public string RunNumber { get; set; }

        [XmlElement("bhaRunNumber")]
        public string BHARunNumber { get; set; }

        [XmlElement("pass")]
        public string Pass { get; set; }

        [XmlElement("creationDate")]
        public string CreationDate { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("indexType")]
        public string IndexType { get; set; }

        [XmlElement("startIndex")]
        public WitsmlIndex StartIndex { get; set; }

        [XmlElement("endIndex")]
        public WitsmlIndex EndIndex { get; set; }

        [XmlElement("startDateTimeIndex")]
        public string StartDateTimeIndex { get; set; }

        [XmlElement("endDateTimeIndex")]
        public string EndDateTimeIndex { get; set; }

        [XmlElement("direction")]
        public string Direction { get; set; }

        [XmlElement("indexCurve")]
        public WitsmlIndexCurve IndexCurve { get; set; }

        [XmlElement("logCurveInfo")]
        public List<WitsmlLogCurveInfo> LogCurveInfo { get; set; }

        [XmlElement("logData")]
        public WitsmlLogData LogData { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
