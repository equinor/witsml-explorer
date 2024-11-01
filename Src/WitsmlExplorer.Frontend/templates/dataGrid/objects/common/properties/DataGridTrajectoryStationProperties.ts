import { DataGridProperty } from "templates/dataGrid/DataGridProperty";
import { dataGridCommonData } from "templates/dataGrid/objects/common/DataGridCommonData";
import { dataGridExtensionNameValue } from "templates/dataGrid/objects/common/DataGridExtensionNameValue";
import { dataGridLocationProperties } from "templates/dataGrid/objects/common/properties/DataGridLocationProperties";
import { dataGridMeasuredDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridMeasuredDepthCoordProperties";
import { dataGridRefNameStringProperties } from "templates/dataGrid/objects/common/properties/DataGridRefNameStringProperties";
import { dataGridUomProperties } from "templates/dataGrid/objects/common/properties/DataGridUomProperties";
import { dataGridWellVerticalDepthCoordProperties } from "templates/dataGrid/objects/common/properties/DataGridWellVerticalDepthCoordProperties";

export const dataGridTrajectoryStationProperties: DataGridProperty[] = [
  {
    name: "uid",
    documentation: "Unique identifier for the trajectory station.",
    isAttribute: true
  },
  {
    name: "target",
    documentation: "A pointer to the intended target of this station. ",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "dTimStn",
    documentation: "Date and time the station was measured or created. "
  },
  {
    name: "typeTrajStation",
    documentation: "Type of survey station. "
  },
  {
    name: "typeSurveyTool",
    documentation: "The type of tool used for the measurements."
  },
  {
    name: "calcAlgorithm",
    documentation: "The type of algorithm used in the position calculation."
  },
  {
    name: "md",
    documentation:
      'Measured depth of measurement from the drill datum. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "tvd",
    documentation: "Vertical depth of the measurements. ",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "incl",
    documentation: "Hole inclination, measured from vertical. ",
    properties: dataGridUomProperties
  },
  {
    name: "azi",
    documentation: "Hole azimuth. Corrected to wells azimuth reference. ",
    properties: dataGridUomProperties
  },
  {
    name: "mtf",
    documentation: "Toolface angle (magnetic). ",
    properties: dataGridUomProperties
  },
  {
    name: "gtf",
    documentation: "Toolface angle (gravity). ",
    properties: dataGridUomProperties
  },
  {
    name: "dispNs",
    documentation:
      "North-south offset, positive to the North. This is relative to wellLocation with a North axis orientation of aziRef. If a displacement with respect to a different point is desired then define a localCRS and specify local coordinates in location.",
    properties: dataGridUomProperties
  },
  {
    name: "dispEw",
    documentation:
      "East-west offset, positive to the East. This is relative to wellLocation with a North axis orientation of aziRef. If a displacement with respect to a different point is desired then define a localCRS and specify local coordinates in location. ",
    properties: dataGridUomProperties
  },
  {
    name: "vertSect",
    documentation: "Distance along vertical section azimuth plane. ",
    properties: dataGridUomProperties
  },
  {
    name: "dls",
    documentation: "Dogleg severity. ",
    properties: dataGridUomProperties
  },
  {
    name: "rateTurn",
    documentation: "Turn rate, radius of curvature computation. ",
    properties: dataGridUomProperties
  },
  {
    name: "rateBuild",
    documentation: "Build Rate, radius of curvature computation. ",
    properties: dataGridUomProperties
  },
  {
    name: "mdDelta",
    documentation: "Delta measured depth from previous station. ",
    properties: dataGridUomProperties
  },
  {
    name: "tvdDelta",
    documentation: "Delta true vertical depth from previous station. ",
    properties: dataGridUomProperties
  },
  {
    name: "modelToolError",
    documentation:
      "DEPRECATED. Tool error model used to compute covariance matrix. "
  },
  {
    name: "iscwsaToolErrorModel",
    documentation:
      "Reference to the toolErrorModel object used to compute covariance matrix.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "gravTotalUncert",
    documentation: "Survey tool gravity uncertainty. ",
    properties: dataGridUomProperties
  },
  {
    name: "dipAngleUncert",
    documentation: "Survey tool dip uncertainty. ",
    properties: dataGridUomProperties
  },
  {
    name: "magTotalUncert",
    documentation: "Survey tool magnetic uncertainty. ",
    properties: dataGridUomProperties
  },
  {
    name: "gravAccelCorUsed",
    documentation:
      'Was an accelerometer alignment correction applied to survey computation? Values are "true" (or "1") and "false" (or "0"). '
  },
  {
    name: "magXAxialCorUsed",
    documentation:
      'Was a magnetometer alignment correction applied to survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "sagCorUsed",
    documentation:
      'Was a bottom hole assembly sag correction applied to the survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "magDrlstrCorUsed",
    documentation:
      'Was a drillstring magnetism correction applied to survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "infieldRefCorUsed",
    documentation:
      'Was an In Field Referencing (IFR) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). An IFR survey measures the strength and direction of the Earth\'s magnetic field over the area of interest. By taking a geomagnetic modelled values away from these field survey results, we are left with a local crustal correction, which since it is assumed geological in nature, only varies over geological timescales. For MWD survey operations, these corrections are applied in addition to the geomagnetic model to provide accurate knowledge of the local magnetic field and hence to improve the accuracy of MWD magnetic azimuth measurements.'
  },
  {
    name: "interpolatedInfieldRefCorUsed",
    documentation:
      'Was an Interpolated In Field Referencing (IIFR) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). Interpolated In Field Referencing measures the diurnal Earth magnetic field variations resulting from electrical currents in the ionosphere and effects of magnetic storms hitting the Earth. It increases again the accuracy of the magnetic azimuth measurement.'
  },
  {
    name: "inHoleRefCorUsed",
    documentation:
      'Was an In Hole Referencing (IHR) correction applied to the inclination and/or azimuth values? Values are "true" (or "1") and "false" (or "0"). In-Hole Referencing essentially involves comparing gyro surveys to MWD surveys in a tangent section of a well. Once a small part of a tangent section has been drilled and surveyed using an MWD tool, then an open hole (OH) gyro is run. By comparing the Gyro surveys to the MWD surveys a correction can be calculated for the MWD. This correction is then assumed as valid for the rest of the tangent section allowing to have a near gyro accuracy for the whole section, therefore reducing the ellipse of uncertainty (EOU) size.'
  },
  {
    name: "axialMagInterferenceCorUsed",
    documentation:
      'Was an Axial Magnetic Interference (AMI) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). Most of the BHAs used to drill wells include an MWD tool. An MWD is a magnetic survey tool and as such suffer from magnetic interferences from a wide variety of sources. Magnetic interferences can be categorized into axial and radial type interferences. Axial interferences are mainly the result of magnetic poles from the drill string steel components located below and above the MWD tool. Radial interferences are numerous. Therefore, there is a risk that magXAxialCorUsed includes both Axial and radial corrections.'
  },
  {
    name: "cosagCorUsed",
    documentation:
      'WWas a Cosag Correction applied to the azimuth values? Values are "true" (or "1") and "false" (or "0"). The BHA Sag Correction is the same as the Sag Correction except it includes the horizontal misalignment (Cosag).'
  },
  {
    name: "MSACorUsed",
    documentation:
      'Was a correction applied to the survey due to a Multi-Station Analysis process? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "gravTotalFieldReference",
    documentation: "Gravitational field theoretical/reference value. ",
    properties: dataGridUomProperties
  },
  {
    name: "magTotalFieldReference",
    documentation: "Geomagnetic field theoretical/reference value. ",
    properties: dataGridUomProperties
  },
  {
    name: "magDipAngleReference",
    documentation: "Magnetic dip angle theoretical/reference value. ",
    properties: dataGridUomProperties
  },
  {
    name: "magModelUsed",
    documentation: "Geomagnetic model used. "
  },
  {
    name: "magModelValid",
    documentation: "Current valid interval for the geomagnetic model used. "
  },
  {
    name: "geoModelUsed",
    documentation: "Gravitational model used. "
  },
  {
    name: "statusTrajStation",
    documentation: "Status of the station. "
  },
  {
    name: "rawData",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "gravAxialRaw",
        documentation:
          "Uncorrected gravitational field strength measured in axial direction.",
        properties: dataGridUomProperties
      },
      {
        name: "gravTran1Raw",
        documentation:
          "Uncorrected gravitational field strength measured in transverse direction.",
        properties: dataGridUomProperties
      },
      {
        name: "gravTran2Raw",
        documentation:
          "Uncorrected gravitational field strength measured in transverse direction, approximately normal to tran1.",
        properties: dataGridUomProperties
      },
      {
        name: "magAxialRaw",
        documentation:
          "Uncorrected magnetic field strength measured in axial direction.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran1Raw",
        documentation:
          "Uncorrected magnetic field strength measured in transverse direction.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran2Raw",
        documentation:
          "Uncorrected magnetic field strength measured in transverse direction, approximately normal to tran1.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "corUsed",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "gravAxialAccelCor",
        documentation: "Calculated gravitational field strength correction.",
        properties: dataGridUomProperties
      },
      {
        name: "gravTran1AccelCor",
        documentation:
          "The correction applied to a cross-axial (direction 1) component of the Earths gravitational field.",
        properties: dataGridUomProperties
      },
      {
        name: "gravTran2AccelCor",
        documentation:
          "The correction applied to a cross-axial (direction 2) component of the Earths gravitational field.",
        properties: dataGridUomProperties
      },
      {
        name: "magAxialDrlstrCor",
        documentation: "Axial magnetic drillstring correction.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran1DrlstrCor",
        documentation: "Cross-axial magnetic correction.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran2DrlstrCor",
        documentation: "Cross-axial magnetic correction.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran1MSACor",
        documentation:
          "Cross-axial (direction 1) magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties
      },
      {
        name: "magTran2MSACor",
        documentation:
          "Cross-axial (direction 2) magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties
      },
      {
        name: "magAxialMSACor",
        documentation:
          "Axial magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties
      },
      {
        name: "sagIncCor",
        documentation: "Calculated sag correction to inclination.",
        properties: dataGridUomProperties
      },
      {
        name: "sagAziCor",
        documentation: "Calculated cosag correction to azimuth.",
        properties: dataGridUomProperties
      },
      {
        name: "stnMagDeclUsed",
        documentation:
          "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth.  Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added.",
        properties: dataGridUomProperties
      },
      {
        name: "stnGridCorUsed",
        documentation:
          "DEPRECATED - use stnGridConUsed. Grid Correction (Meridian convergence). The angle between True North and Grid North. Grid Correction is positive when True North is west of Grid North. The correction is added to the raw observation, thus yielding a reduced or corrected observation that can go into the subsequent calculations.",
        properties: dataGridUomProperties
      },
      {
        name: "stnGridConUsed",
        documentation:
          "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth.  Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added.",
        properties: dataGridUomProperties
      },
      {
        name: "dirSensorOffset",
        documentation: "Offset relative to bit.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "valid",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "magTotalFieldCalc",
        documentation:
          "Calculated total intensity of the geomagnetic field as sum of BGGM, IFR and local field.",
        properties: dataGridUomProperties
      },
      {
        name: "magDipAngleCalc",
        documentation:
          "Calculated magnetic dip (inclination), the angle between the horizontal and the geomagnetic field (positive down, res .001).",
        properties: dataGridUomProperties
      },
      {
        name: "gravTotalFieldCalc",
        documentation: "Calculated total gravitational field.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "matrixCov",
    documentation: "Covariance matrix for error model. ",
    isContainer: true,
    properties: [
      {
        name: "varianceNN",
        documentation: "Covariance north north.",
        properties: dataGridUomProperties
      },
      {
        name: "varianceNE",
        documentation: "Crossvariance north east.",
        properties: dataGridUomProperties
      },
      {
        name: "varianceNVert",
        documentation: "Crossvariance north vertical.",
        properties: dataGridUomProperties
      },
      {
        name: "varianceEE",
        documentation: "Covariance east east.",
        properties: dataGridUomProperties
      },
      {
        name: "varianceEVert",
        documentation: "Crossvariance east vertical.",
        properties: dataGridUomProperties
      },
      {
        name: "varianceVertVert",
        documentation: "Covariance vertical vertical.",
        properties: dataGridUomProperties
      },
      {
        name: "biasN",
        documentation: "Bias north.",
        properties: dataGridUomProperties
      },
      {
        name: "biasE",
        documentation: "Bias east.",
        properties: dataGridUomProperties
      },
      {
        name: "biasVert",
        documentation:
          "Bias vertical. The coordinate system is set up in a right-handed configuration which makes the vertical direction increasing (i.e., positive) downwards.",
        properties: dataGridUomProperties
      }
    ]
  },
  {
    name: "location",
    documentation:
      'The 2D coordinates of the item. Note that within the context of trajectory, the "original" coordinates are inherently local coordinates as defined above.',
    isContainer: true,
    isMultiple: true,
    properties: dataGridLocationProperties
  },
  {
    name: "sourceStation",
    documentation:
      "A pointer to the trajectoryStation from which this station was derived. The trajectoryStation may be in another wellbore.",
    isContainer: true,
    properties: [
      {
        name: "stationReference",
        documentation:
          "A pointer to the trajectoryStation within the parent trajectory. This is a special case where we only use a uid for the pointer. The natural identity of a station is its physical characteristics (e.g., md)."
      },
      {
        name: "trajectoryParent",
        documentation:
          "A pointer to the trajectory within the parent wellbore. This trajectory contains the trajectoryStation.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "wellboreParent",
        documentation:
          "A pointer to the wellbore that contains the trajectory. This is not needed unless the trajectory is outside the context of a common parent wellbore.",
        properties: dataGridRefNameStringProperties
      }
    ]
  },
  dataGridCommonData,
  dataGridExtensionNameValue
];
