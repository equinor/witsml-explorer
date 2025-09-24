using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public enum WitsmlRequirementPurpose
{

    [XmlEnumAttribute("display range")]
    Displayrange,

    [XmlEnum("sensor range")]
    Sensorrange,

    [XmlEnum("alarm threshold")]
    Alarmthreshold,

    [XmlEnum("operational range")]
    Operationalrange,

    [XmlEnum("calibration")]
    Calibration,

    [XmlEnum("safety range")]
    Safetyrange,

    [XmlEnum("workflow specific")]
    Workflowspecific,


    [XmlEnum("quality requirements")]
    Qualityrequirements,

    [XmlEnum("other")]
    Other,
}
