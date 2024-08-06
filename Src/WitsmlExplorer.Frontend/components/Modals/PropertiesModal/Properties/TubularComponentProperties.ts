import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validPositiveInteger,
  validText
} from "components/Modals/ModalParts";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { boxPinConfigTypes } from "models/boxPinConfigTypes";
import { materialTypes } from "models/materialTypes";
import MaxLength from "models/maxLength";
import TubularComponent from "models/tubularComponent";
import { tubularComponentTypes } from "models/tubularComponentTypes";

export const getTubularComponentProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<TubularComponent>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "sequence",
    propertyType: PropertyType.Number,
    validator: (value: string) =>
      validPositiveInteger(value) && parseInt(value) > 0,
    helperText: "sequence must be a positive non-zero integer"
  },
  {
    property: "description",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText("description", MaxLength.Description)
  },
  {
    property: "typeTubularComponent",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, tubularComponentTypes),
    helperText: getOptionHelperText("typeTubularComponent"),
    options: tubularComponentTypes
  },
  {
    property: "id",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("id")
  },
  {
    property: "od",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("od")
  },
  {
    property: "len",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("len")
  },
  {
    property: "wtPerLen",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("wtPerLen")
  },
  {
    property: "numJointStand",
    propertyType: PropertyType.Number,
    validator: validPositiveInteger,
    helperText: "numJointStand must be a positive integer"
  },
  {
    property: "configCon",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, boxPinConfigTypes),
    helperText: getOptionHelperText("configCon"),
    options: boxPinConfigTypes
  },
  {
    property: "typeMaterial",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, materialTypes),
    helperText: getOptionHelperText("typeMaterial"),
    options: materialTypes
  },
  {
    property: "vendor",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("vendor", MaxLength.Name)
  },
  {
    property: "model",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("model", MaxLength.Name)
  }
];
