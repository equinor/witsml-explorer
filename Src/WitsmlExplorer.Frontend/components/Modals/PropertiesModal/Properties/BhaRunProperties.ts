import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validPositiveInteger,
  validRefNameString,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText,
  getRefNameStringHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import BhaRun from "models/bhaRun";
import { bhaStatusTypes } from "models/bhaStatusTypes";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";

export const getBhaRunProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<BhaRun>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "tubular",
    propertyType: PropertyType.RefNameString,
    validator: validRefNameString,
    helperText: getRefNameStringHelperText("tubular"),
    required: true
  },
  {
    property: "dTimStart",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimStop",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimStartDrilling",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimStopDrilling",
    propertyType: PropertyType.DateTime
  },
  {
    property: "planDogleg",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("planDogleg")
  },
  {
    property: "actDogleg",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("actDogleg")
  },
  {
    property: "actDoglegMx",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("actDoglegMx")
  },
  {
    property: "statusBha",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, bhaStatusTypes),
    helperText: getOptionHelperText("statusBha"),
    options: bhaStatusTypes
  },
  {
    property: "numBitRun",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("numBitRun", MaxLength.Name)
  },
  {
    property: "numStringRun",
    propertyType: PropertyType.StringNumber,
    validator: validPositiveInteger,
    helperText: "numStringRun must be a positive integer"
  },
  {
    property: "reasonTrip",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("numBitRun", MaxLength.Comment)
  },
  {
    property: "objectiveBha",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("objectiveBha", MaxLength.Comment)
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
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
  },
  {
    property: "commonData.sourceName",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("sourceName", MaxLength.Name)
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
    property: "commonData.defaultDatum",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("defaultDatum", MaxLength.Name)
  }
];
