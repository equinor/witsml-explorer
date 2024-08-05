import {
  PropertiesModalMode,
  validMeasure,
  validMultiOption,
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
import { levelIntegerCode } from "models/levelIntegerCode";
import MaxLength from "models/maxLength";
import { riskAffectedPersonnel } from "models/riskAffectedPersonnel";
import { riskCategory } from "models/riskCategory";
import RiskObject from "models/riskObject";
import { riskSubCategory } from "models/riskSubCategory";
import { riskType } from "models/riskType";

export const getRiskProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<RiskObject>[] => [
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
    property: "type",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, riskType),
    helperText: getOptionHelperText("type"),
    options: riskType,
    required: true
  },
  {
    property: "category",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, riskCategory),
    helperText: getOptionHelperText("category"),
    options: riskCategory,
    required: true
  },
  {
    property: "subCategory",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, riskSubCategory),
    helperText: getOptionHelperText("subCategory"),
    options: riskSubCategory
  },
  {
    property: "extendCategory",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Enum),
    helperText: getMaxLengthHelperText("extendCategory", MaxLength.Enum)
  },
  {
    property: "affectedPersonnel",
    propertyType: PropertyType.Options,
    validator: (value: string) =>
      validMultiOption(value, riskAffectedPersonnel),
    helperText: getOptionHelperText("affectedPersonnel"),
    options: riskAffectedPersonnel,
    multiSelect: true
  },
  {
    property: "dTimStart",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimEnd",
    propertyType: PropertyType.DateTime
  },
  {
    property: "mdBitStart",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdBitStart")
  },
  {
    property: "mdBitEnd",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdBitEnd")
  },
  {
    property: "severityLevel",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, levelIntegerCode),
    helperText: getOptionHelperText("severityLevel"),
    options: levelIntegerCode
  },
  {
    property: "probabilityLevel",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, levelIntegerCode),
    helperText: getOptionHelperText("severityLevel"),
    options: levelIntegerCode
  },
  {
    property: "summary",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText("summary", MaxLength.Description)
  },
  {
    property: "details",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText("details", MaxLength.Description)
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
  }
];
