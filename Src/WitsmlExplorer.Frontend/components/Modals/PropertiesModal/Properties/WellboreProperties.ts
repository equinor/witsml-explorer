import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import MaxLength from "models/maxLength";
import Wellbore from "models/wellbore";
import { wellborePurposeValues } from "models/wellborePurposeValues";

export const getWellboreProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Wellbore>[] => [
  {
    property: "wellUid",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "wellName",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "wellboreParentName",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "name",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("name", MaxLength.Name),
    required: true
  },
  {
    property: "wellborePurpose",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, wellborePurposeValues),
    helperText: getOptionHelperText("wellborePurpose"),
    options: wellborePurposeValues
  },
  {
    property: "number",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("number", MaxLength.String32)
  },
  {
    property: "suffixAPI",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("suffixAPI", MaxLength.Name)
  },
  {
    property: "numGovt",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("numGovt", MaxLength.Name)
  },
  {
    property: "dTimeKickoff",
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
    property: "mdKickoff",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdKickoff")
  },
  {
    property: "tvdKickoff",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdKickoff")
  },
  {
    property: "mdPlanned",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdPlanned")
  },
  {
    property: "tvdPlanned",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdPlanned")
  },
  {
    property: "mdSubSeaPlanned",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdSubSeaPlanned")
  },
  {
    property: "tvdSubSeaPlanned",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdSubSeaPlanned")
  },
  {
    property: "dayTarget",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("dayTarget")
  },
  {
    property: "dateTimeCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "dateTimeLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "comments",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("comments", MaxLength.Comment),
    multiline: true
  }
];
