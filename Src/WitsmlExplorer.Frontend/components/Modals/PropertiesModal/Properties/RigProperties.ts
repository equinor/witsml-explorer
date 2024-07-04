import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validPhoneNumber,
  validPositiveInteger,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText,
  getPhoneNumberHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";
import Rig from "models/rig";
import { rigType } from "models/rigType";

export const getRigProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Rig>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "typeRig",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, rigType),
    helperText: getOptionHelperText("typeRig"),
    options: rigType
  },
  {
    property: "dTimStartOp",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimEndOp",
    propertyType: PropertyType.DateTime
  },
  {
    property: "yearEntService",
    propertyType: PropertyType.StringNumber,
    validator: (num: string) =>
      validPositiveInteger(num) && validText(num, 4, 4),
    helperText: "yearEntService must be a 4 digit positive integer"
  },
  {
    property: "telNumber",
    propertyType: PropertyType.String,
    validator: validPhoneNumber,
    helperText: getPhoneNumberHelperText("telNumber")
  },
  {
    property: "faxNumber",
    propertyType: PropertyType.String,
    validator: validPhoneNumber,
    helperText: getPhoneNumberHelperText("faxNumber")
  },
  {
    property: "emailAddress",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("emailAddress", MaxLength.Name)
  },
  {
    property: "nameContact",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("nameContact", MaxLength.Name)
  },
  {
    property: "ratingDrillDepth",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("ratingDrillDepth")
  },
  {
    property: "ratingWaterDepth",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("ratingWaterDepth")
  },
  {
    property: "airGap",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("airGap")
  },
  {
    property: "owner",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("owner", MaxLength.String32)
  },
  {
    property: "manufacturer",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("manufacturer", MaxLength.Name)
  },
  {
    property: "classRig",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("classRig", MaxLength.String32)
  },
  {
    property: "approvals",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("approvals", MaxLength.Name)
  },
  {
    property: "registration",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("registration", MaxLength.String32)
  },
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  }
];

export const getBatchModifyRigProperties =
  (): PropertiesModalProperty<Rig>[] => [
    {
      property: "owner",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 0, MaxLength.String32),
      helperText: getMaxLengthHelperText("owner", MaxLength.String32)
    },
    {
      property: "typeRig",
      propertyType: PropertyType.Options,
      validator: (value: string) => validOption(value, rigType),
      helperText: getOptionHelperText("typeRig"),
      options: rigType
    },
    {
      property: "manufacturer",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 0, MaxLength.Name),
      helperText: getMaxLengthHelperText("manufacturer", MaxLength.Name)
    },
    {
      property: "classRig",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 0, MaxLength.String32),
      helperText: getMaxLengthHelperText("classRig", MaxLength.String32)
    },
    {
      property: "approvals",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 0, MaxLength.Name),
      helperText: getMaxLengthHelperText("approvals", MaxLength.Name)
    },
    {
      property: "registration",
      propertyType: PropertyType.String,
      validator: (value: string) => validText(value, 0, MaxLength.String32),
      helperText: getMaxLengthHelperText("registration", MaxLength.String32)
    }
  ];
