import {
  PropertiesModalMode,
  validMeasure,
  validText
} from "components/Modals/ModalParts";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import MaxLength from "models/maxLength";
import TrajectoryStation from "models/trajectoryStation";

export const getTrajectoryStationProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<TrajectoryStation>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "typeTrajStation",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "dTimStn",
    propertyType: PropertyType.DateTime
  },
  {
    property: "md",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("md")
  },
  {
    property: "tvd",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvd")
  },
  {
    property: "azi",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("azi")
  },
  {
    property: "incl",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("incl")
  },
  {
    property: "mtf",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "gtf",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "dispNs",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "dispEw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "vertSect",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "dls",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "rateTurn",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "rateBuild",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "gravTotalUncert",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "dipAngleUncert",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "magTotalUncert",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "gravTotalFieldReference",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "magTotalFieldReference",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "magDipAngleReference",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "statusTrajStation",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "gravAxialRaw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "gravTran1Raw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "gravTran2Raw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "magAxialRaw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "rawData.magTran1Raw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "rawData.magTran2Raw",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.gravAxialAccelCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.gravTran1AccelCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.gravTran2AccelCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.magAxialDrlstrCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.magTran1DrlstrCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.magTran2DrlstrCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.sagIncCor",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.stnMagDeclUsed",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.stnGridCorUsed",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "corUsed.dirSensorOffset",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "valid.magTotalFieldCalc",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "valid.magDipAngleCalc",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "valid.gravTotalFieldCalc",
    propertyType: PropertyType.Measure,
    disabled: true
  }
];
