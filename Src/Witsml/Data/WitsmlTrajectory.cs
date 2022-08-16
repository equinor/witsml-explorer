using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Data
{
    public class WitsmlTrajectory : ObjectOnWellbore<WitsmlTrajectories>
    {
        public override WitsmlTrajectories AsSingletonWitsmlList()
        {
            return new WitsmlTrajectories()
            {
                Trajectories = this.AsSingletonList()
            };
        }

        [XmlIgnore]
        public bool? ObjectGrowing { get; set; }
        [XmlElement("objectGrowing")]
        public string ObjectGrowingText
        {
            get { return ObjectGrowing.HasValue ? XmlConvert.ToString(ObjectGrowing.Value) : null; }
            set { ObjectGrowing = !string.IsNullOrEmpty(value) ? bool.Parse(value) : default(bool?); }
        }

        [XmlElement("parentTrajectory")] public WitsmlWellboreTrajectory ParentTrajectory { get; set; }
        [XmlElement("dTimTrajStart")] public string DTimTrajStart { get; set; }
        [XmlElement("dTimTrajEnd")] public string DTimTrajEnd { get; set; }
        [XmlElement("mdMn")] public WitsmlMeasuredDepthCoord MdMin { get; set; }
        [XmlElement("mdMx")] public WitsmlMeasuredDepthCoord MdMax { get; set; }
        [XmlElement("serviceCompany")] public string ServiceCompany { get; set; }
        [XmlElement("magDeclUsed")] public WitsmlPlaneAngleMeasure MagDeclUsed { get; set; }
        [XmlElement("gridCorUsed")] public WitsmlPlaneAngleMeasure GridCorUsed { get; set; }
        [XmlElement("gridConUsed")] public WitsmlPlaneAngleMeasure GridConUsed { get; set; }
        [XmlElement("aziVertSect")] public WitsmlPlaneAngleMeasure AziVertSect { get; set; }
        [XmlElement("dispNsVertSectOrig")] public WitsmlLengthMeasure DispNsVertSectOrig { get; set; }
        [XmlElement("dispEwVertSectOrig")] public WitsmlLengthMeasure DispEwVertSectOrig { get; set; }
        [XmlElement("definitive")] public string Definitive { get; set; }
        [XmlElement("memory")] public string Memory { get; set; }
        [XmlElement("finalTraj")] public string FinalTraj { get; set; }
        [XmlElement("aziRef")] public string AziRef { get; set; }
        [XmlElement("trajectoryStation")] public List<WitsmlTrajectoryStation> TrajectoryStations { get; set; }
        [XmlElement("commonData")] public WitsmlCommonData CommonData { get; set; }
        [XmlElement("customData")] public WitsmlCustomData CustomData { get; set; }
    }
}
