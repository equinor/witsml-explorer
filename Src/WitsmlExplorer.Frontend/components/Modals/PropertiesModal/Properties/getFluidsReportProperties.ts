import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validPositiveInteger,
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
import FluidsReport from "models/fluidsReport";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";

export const getFluidsReportProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<FluidsReport>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "dTim",
    propertyType: PropertyType.DateTime,
    required: true
  },
  {
    property: "md",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("md"),
    required: true
  },
  {
    property: "tvd",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvd")
  },
  {
    property: "numReport",
    propertyType: PropertyType.StringNumber,
    validator: validPositiveInteger,
    helperText: "numReport must be a positive integer"
  },
  {
    property: "commonData.sourceName",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("sourceName", MaxLength.Name)
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  },
  {
    property: "commonData.serviceCategory",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Enum),
    helperText: getMaxLengthHelperText("serviceCategory", MaxLength.Enum)
  },
  {
    property: "commonData.comments",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("comments", MaxLength.Comment),
    multiline: true
  },
  {
    property: "commonData.dTimCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "commonData.dTimLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  }
];
