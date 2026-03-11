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
    required: false,
    baseType: "string",
    witsmlType: "uidString",
    maxLength: 64,
    documentation: "Unique identifier for the trajectory station.",
    isAttribute: true
  },
  {
    name: "target",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation: "A pointer to the intended target of this station. ",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "dTimStn",
    required: false,
    baseType: "dateTime",
    witsmlType: "timestamp",
    documentation: "Date and time the station was measured or created. "
  },
  {
    name: "typeTrajStation",
    required: true,
    baseType: "string",
    witsmlType: "trajStationType",
    maxLength: 50,
    documentation: "Type of survey station. "
  },
  {
    name: "typeSurveyTool",
    required: false,
    baseType: "string",
    witsmlType: "typeSurveyTool",
    maxLength: 50,
    documentation: "The type of tool used for the measurements."
  },
  {
    name: "calcAlgorithm",
    required: false,
    baseType: "string",
    witsmlType: "trajStnCalcAlgorithm",
    maxLength: 50,
    documentation: "The type of algorithm used in the position calculation."
  },
  {
    name: "md",
    required: true,
    baseType: "double",
    witsmlType: "measuredDepthCoord",
    documentation:
      'Measured depth of measurement from the drill datum. This is an API "node-index" query parameter for growing objects. See the relevant API specification for the query behavior related to this element.',
    properties: dataGridMeasuredDepthCoordProperties
  },
  {
    name: "tvd",
    required: false,
    baseType: "double",
    witsmlType: "wellVerticalDepthCoord",
    documentation: "Vertical depth of the measurements. ",
    properties: dataGridWellVerticalDepthCoordProperties
  },
  {
    name: "incl",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Hole inclination, measured from vertical. ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "azi",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Hole azimuth. Corrected to wells azimuth reference. ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "mtf",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Toolface angle (magnetic). ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "gtf",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Toolface angle (gravity). ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "dispNs",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "North-south offset, positive to the North. This is relative to wellLocation with a North axis orientation of aziRef. If a displacement with respect to a different point is desired then define a localCRS and specify local coordinates in location.",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "dispEw",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation:
      "East-west offset, positive to the East. This is relative to wellLocation with a North axis orientation of aziRef. If a displacement with respect to a different point is desired then define a localCRS and specify local coordinates in location. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "vertSect",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Distance along vertical section azimuth plane. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "dls",
    required: false,
    baseType: "double",
    witsmlType: "anglePerLengthMeasure",
    documentation: "Dogleg severity. ",
    properties: dataGridUomProperties("anglePerLengthUom")
  },
  {
    name: "rateTurn",
    required: false,
    baseType: "double",
    witsmlType: "anglePerLengthMeasure",
    documentation: "Turn rate, radius of curvature computation. ",
    properties: dataGridUomProperties("anglePerLengthUom")
  },
  {
    name: "rateBuild",
    required: false,
    baseType: "double",
    witsmlType: "anglePerLengthMeasure",
    documentation: "Build Rate, radius of curvature computation. ",
    properties: dataGridUomProperties("anglePerLengthUom")
  },
  {
    name: "mdDelta",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Delta measured depth from previous station. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "tvdDelta",
    required: false,
    baseType: "double",
    witsmlType: "lengthMeasure",
    documentation: "Delta true vertical depth from previous station. ",
    properties: dataGridUomProperties("lengthUom")
  },
  {
    name: "modelToolError",
    required: false,
    baseType: "string",
    witsmlType: "commentString",
    maxLength: 4000,
    documentation:
      "DEPRECATED. Tool error model used to compute covariance matrix. "
  },
  {
    name: "iscwsaToolErrorModel",
    required: false,
    baseType: "string",
    witsmlType: "refNameString",
    maxLength: 64,
    documentation:
      "Reference to the toolErrorModel object used to compute covariance matrix.",
    properties: dataGridRefNameStringProperties
  },
  {
    name: "gravTotalUncert",
    required: false,
    baseType: "double",
    witsmlType: "accelerationLinearMeasure",
    documentation: "Survey tool gravity uncertainty. ",
    properties: dataGridUomProperties("accelerationLinearUom")
  },
  {
    name: "dipAngleUncert",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Survey tool dip uncertainty. ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "magTotalUncert",
    required: false,
    baseType: "double",
    witsmlType: "magneticInductionMeasure",
    documentation: "Survey tool magnetic uncertainty. ",
    properties: dataGridUomProperties("magneticInductionUom")
  },
  {
    name: "gravAccelCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was an accelerometer alignment correction applied to survey computation? Values are "true" (or "1") and "false" (or "0"). '
  },
  {
    name: "magXAxialCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was a magnetometer alignment correction applied to survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "sagCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was a bottom hole assembly sag correction applied to the survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "magDrlstrCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was a drillstring magnetism correction applied to survey computation? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "infieldRefCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was an In Field Referencing (IFR) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). An IFR survey measures the strength and direction of the Earth\'s magnetic field over the area of interest. By taking a geomagnetic modelled values away from these field survey results, we are left with a local crustal correction, which since it is assumed geological in nature, only varies over geological timescales. For MWD survey operations, these corrections are applied in addition to the geomagnetic model to provide accurate knowledge of the local magnetic field and hence to improve the accuracy of MWD magnetic azimuth measurements.'
  },
  {
    name: "interpolatedInfieldRefCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was an Interpolated In Field Referencing (IIFR) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). Interpolated In Field Referencing measures the diurnal Earth magnetic field variations resulting from electrical currents in the ionosphere and effects of magnetic storms hitting the Earth. It increases again the accuracy of the magnetic azimuth measurement.'
  },
  {
    name: "inHoleRefCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was an In Hole Referencing (IHR) correction applied to the inclination and/or azimuth values? Values are "true" (or "1") and "false" (or "0"). In-Hole Referencing essentially involves comparing gyro surveys to MWD surveys in a tangent section of a well. Once a small part of a tangent section has been drilled and surveyed using an MWD tool, then an open hole (OH) gyro is run. By comparing the Gyro surveys to the MWD surveys a correction can be calculated for the MWD. This correction is then assumed as valid for the rest of the tangent section allowing to have a near gyro accuracy for the whole section, therefore reducing the ellipse of uncertainty (EOU) size.'
  },
  {
    name: "axialMagInterferenceCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was an Axial Magnetic Interference (AMI) correction applied to the azimuth value? Values are "true" (or "1") and "false" (or "0"). Most of the BHAs used to drill wells include an MWD tool. An MWD is a magnetic survey tool and as such suffer from magnetic interferences from a wide variety of sources. Magnetic interferences can be categorized into axial and radial type interferences. Axial interferences are mainly the result of magnetic poles from the drill string steel components located below and above the MWD tool. Radial interferences are numerous. Therefore, there is a risk that magXAxialCorUsed includes both Axial and radial corrections.'
  },
  {
    name: "cosagCorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'WWas a Cosag Correction applied to the azimuth values? Values are "true" (or "1") and "false" (or "0"). The BHA Sag Correction is the same as the Sag Correction except it includes the horizontal misalignment (Cosag).'
  },
  {
    name: "MSACorUsed",
    required: false,
    baseType: "boolean",
    witsmlType: "logicalBoolean",
    documentation:
      'Was a correction applied to the survey due to a Multi-Station Analysis process? Values are "true" (or "1") and "false" (or "0").'
  },
  {
    name: "gravTotalFieldReference",
    required: false,
    baseType: "double",
    witsmlType: "accelerationLinearMeasure",
    documentation: "Gravitational field theoretical/reference value. ",
    properties: dataGridUomProperties("accelerationLinearUom")
  },
  {
    name: "magTotalFieldReference",
    required: false,
    baseType: "double",
    witsmlType: "magneticInductionMeasure",
    documentation: "Geomagnetic field theoretical/reference value. ",
    properties: dataGridUomProperties("magneticInductionUom")
  },
  {
    name: "magDipAngleReference",
    required: false,
    baseType: "double",
    witsmlType: "planeAngleMeasure",
    documentation: "Magnetic dip angle theoretical/reference value. ",
    properties: dataGridUomProperties("planeAngleUom")
  },
  {
    name: "magModelUsed",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Geomagnetic model used. "
  },
  {
    name: "magModelValid",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Current valid interval for the geomagnetic model used. "
  },
  {
    name: "geoModelUsed",
    required: false,
    baseType: "string",
    witsmlType: "nameString",
    maxLength: 64,
    documentation: "Gravitational model used. "
  },
  {
    name: "statusTrajStation",
    required: false,
    baseType: "string",
    witsmlType: "trajStationStatus",
    maxLength: 50,
    documentation: "Status of the station. "
  },
  {
    name: "rawData",
    required: false,
    witsmlType: "cs_stnTrajRawData",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "gravAxialRaw",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation:
          "Uncorrected gravitational field strength measured in axial direction.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "gravTran1Raw",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation:
          "Uncorrected gravitational field strength measured in transverse direction.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "gravTran2Raw",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation:
          "Uncorrected gravitational field strength measured in transverse direction, approximately normal to tran1.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "magAxialRaw",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Uncorrected magnetic field strength measured in axial direction.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran1Raw",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Uncorrected magnetic field strength measured in transverse direction.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran2Raw",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Uncorrected magnetic field strength measured in transverse direction, approximately normal to tran1.",
        properties: dataGridUomProperties("magneticInductionUom")
      }
    ]
  },
  {
    name: "corUsed",
    required: false,
    witsmlType: "cs_stnTrajCorUsed",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "gravAxialAccelCor",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation: "Calculated gravitational field strength correction.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "gravTran1AccelCor",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation:
          "The correction applied to a cross-axial (direction 1) component of the Earths gravitational field.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "gravTran2AccelCor",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation:
          "The correction applied to a cross-axial (direction 2) component of the Earths gravitational field.",
        properties: dataGridUomProperties("accelerationLinearUom")
      },
      {
        name: "magAxialDrlstrCor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation: "Axial magnetic drillstring correction.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran1DrlstrCor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation: "Cross-axial magnetic correction.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran2DrlstrCor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation: "Cross-axial magnetic correction.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran1MSACor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Cross-axial (direction 1) magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magTran2MSACor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Cross-axial (direction 2) magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magAxialMSACor",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Axial magnetic correction due to multi-station analysis process.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "sagIncCor",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation: "Calculated sag correction to inclination.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "sagAziCor",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation: "Calculated cosag correction to azimuth.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "stnMagDeclUsed",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth.  Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "stnGridCorUsed",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "DEPRECATED - use stnGridConUsed. Grid Correction (Meridian convergence). The angle between True North and Grid North. Grid Correction is positive when True North is west of Grid North. The correction is added to the raw observation, thus yielding a reduced or corrected observation that can go into the subsequent calculations.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "stnGridConUsed",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "Magnetic declination used to correct a Magnetic North referenced azimuth to a True North azimuth.  Magnetic declination angles are measured positive clockwise from True North to Magnetic North (or negative in the anti-clockwise direction). To convert a Magnetic azimuth to a True North azimuth, the magnetic declination should be added.",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "dirSensorOffset",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Offset relative to bit.",
        properties: dataGridUomProperties("lengthUom")
      }
    ]
  },
  {
    name: "valid",
    required: false,
    witsmlType: "cs_stnTrajValid",
    documentation: "Applies only to measured magnetic stations. ",
    isContainer: true,
    properties: [
      {
        name: "magTotalFieldCalc",
        required: false,
        baseType: "double",
        witsmlType: "magneticInductionMeasure",
        documentation:
          "Calculated total intensity of the geomagnetic field as sum of BGGM, IFR and local field.",
        properties: dataGridUomProperties("magneticInductionUom")
      },
      {
        name: "magDipAngleCalc",
        required: false,
        baseType: "double",
        witsmlType: "planeAngleMeasure",
        documentation:
          "Calculated magnetic dip (inclination), the angle between the horizontal and the geomagnetic field (positive down, res .001).",
        properties: dataGridUomProperties("planeAngleUom")
      },
      {
        name: "gravTotalFieldCalc",
        required: false,
        baseType: "double",
        witsmlType: "accelerationLinearMeasure",
        documentation: "Calculated total gravitational field.",
        properties: dataGridUomProperties("accelerationLinearUom")
      }
    ]
  },
  {
    name: "matrixCov",
    required: false,
    witsmlType: "cs_stnTrajMatrixCov",
    documentation: "Covariance matrix for error model. ",
    isContainer: true,
    properties: [
      {
        name: "varianceNN",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Covariance north north.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "varianceNE",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Crossvariance north east.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "varianceNVert",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Crossvariance north vertical.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "varianceEE",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Covariance east east.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "varianceEVert",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Crossvariance east vertical.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "varianceVertVert",
        required: false,
        baseType: "double",
        witsmlType: "areaMeasure",
        documentation: "Covariance vertical vertical.",
        properties: dataGridUomProperties("areaUom")
      },
      {
        name: "biasN",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Bias north.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "biasE",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation: "Bias east.",
        properties: dataGridUomProperties("lengthUom")
      },
      {
        name: "biasVert",
        required: false,
        baseType: "double",
        witsmlType: "lengthMeasure",
        documentation:
          "Bias vertical. The coordinate system is set up in a right-handed configuration which makes the vertical direction increasing (i.e., positive) downwards.",
        properties: dataGridUomProperties("lengthUom")
      }
    ]
  },
  {
    name: "location",
    required: false,
    witsmlType: "cs_location",
    documentation:
      'The 2D coordinates of the item. Note that within the context of trajectory, the "original" coordinates are inherently local coordinates as defined above.',
    isContainer: true,
    isMultiple: true,
    properties: dataGridLocationProperties
  },
  {
    name: "sourceStation",
    required: false,
    witsmlType: "cs_refWellboreTrajectoryStation",
    documentation:
      "A pointer to the trajectoryStation from which this station was derived. The trajectoryStation may be in another wellbore.",
    isContainer: true,
    properties: [
      {
        name: "stationReference",
        required: true,
        baseType: "string",
        witsmlType: "refString",
        maxLength: 64,
        documentation:
          "A pointer to the trajectoryStation within the parent trajectory. This is a special case where we only use a uid for the pointer. The natural identity of a station is its physical characteristics (e.g., md)."
      },
      {
        name: "trajectoryParent",
        required: true,
        baseType: "string",
        witsmlType: "refNameString",
        maxLength: 64,
        documentation:
          "A pointer to the trajectory within the parent wellbore. This trajectory contains the trajectoryStation.",
        properties: dataGridRefNameStringProperties
      },
      {
        name: "wellboreParent",
        required: false,
        baseType: "string",
        witsmlType: "refNameString",
        maxLength: 64,
        documentation:
          "A pointer to the wellbore that contains the trajectory. This is not needed unless the trajectory is outside the context of a common parent wellbore.",
        properties: dataGridRefNameStringProperties
      }
    ]
  },
  dataGridCommonData,
  dataGridExtensionNameValue
];
