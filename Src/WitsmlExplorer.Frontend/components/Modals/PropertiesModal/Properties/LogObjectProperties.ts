import {
  WITSML_INDEX_TYPE_DATE_TIME,
  WITSML_INDEX_TYPE_MD
} from "components/Constants";
import {
  PropertiesModalMode,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { IndexCurve } from "models/indexCurve";
import LogObject from "models/logObject";
import MaxLength from "models/maxLength";

const indexTypeOptions = [WITSML_INDEX_TYPE_MD, WITSML_INDEX_TYPE_DATE_TIME];

export const getLogObjectProperties = (
  mode: PropertiesModalMode,
  indexType: string
): PropertiesModalProperty<LogObject>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "indexCurve",
    propertyType: PropertyType.Options,
    helperText: "indexCurve cannot be empty",
    options: Object.values(IndexCurve),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "indexType",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, indexTypeOptions),
    helperText: getOptionHelperText("indexType"),
    options: indexTypeOptions,
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "runNumber",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Str16),
    helperText: getMaxLengthHelperText("runNumber", MaxLength.Str16)
  },
  {
    property: "serviceCompany",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("serviceCompany", MaxLength.Name)
  },
  {
    property: "objectGrowing",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "startIndex",
    propertyType:
      indexType === WITSML_INDEX_TYPE_DATE_TIME
        ? PropertyType.DateTime
        : PropertyType.String,
    disabled: true
  },
  {
    property: "endIndex",
    propertyType:
      indexType === WITSML_INDEX_TYPE_DATE_TIME
        ? PropertyType.DateTime
        : PropertyType.String,
    disabled: true
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

export const getBatchModifyLogObjectProperties =
  (): PropertiesModalProperty<LogObject>[] => [
    {
      property: "name",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 1, MaxLength.Name),
      helperText: getMaxLengthHelperText("name", MaxLength.Name)
    },
    {
      property: "runNumber",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 1, MaxLength.Str16),
      helperText: getMaxLengthHelperText("runNumber", MaxLength.Str16)
    },
    {
      property: "commonData.comments",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 1, MaxLength.Comment),
      helperText: getMaxLengthHelperText("comments", MaxLength.Comment),
      multiline: true
    }
  ];
