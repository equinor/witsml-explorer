import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";
import WbGeometryObject from "models/wbGeometry";

export const getWbGeometryProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<WbGeometryObject>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "commonData.dTimCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "commonData.dTimLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "dTimReport",
    propertyType: PropertyType.DateTime,
    required: true,
    disabled: mode !== PropertiesModalMode.New
  },
  {
    property: "commonData.sourceName",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "mdBottom",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdBottom")
  },
  {
    property: "gapAir",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("gapAir")
  },
  {
    property: "depthWaterMean",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("depthWaterMean")
  },
  {
    property: "commonData.comments",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("comments", MaxLength.Comment),
    multiline: true
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  }
];
