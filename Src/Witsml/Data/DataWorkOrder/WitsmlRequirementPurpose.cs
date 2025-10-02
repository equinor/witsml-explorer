using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public enum WitsmlRequirementPurpose
{

    [XmlEnumAttribute("display range")]
    DisplayRange,

    [XmlEnum("sensor range")]
    SensorRange,

    [XmlEnum("alarm threshold")]
    AlarmThreshold,

    [XmlEnum("operational range")]
    OperationalRange,

    [XmlEnum("calibration")]
    Calibration,

    [XmlEnum("safety range")]
    SafetyRange,

    [XmlEnum("workflow specific")]
    WorkflowSpecific,


    [XmlEnum("quality requirements")]
    QualityRequirements,

    [XmlEnum("other")]
    Other,
}
