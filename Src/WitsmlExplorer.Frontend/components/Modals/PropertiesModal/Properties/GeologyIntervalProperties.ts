import {
  PropertiesModalMode,
  validMeasure,
  validNumber,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getNumberHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import GeologyInterval from "models/geologyInterval";
import Lithology from "models/lithology";
import { lithologySources } from "models/lithologySources";
import { lithologyTypes } from "models/lithologyTypes";
import MaxLength from "models/maxLength";

export const getGeologyIntervalProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<GeologyInterval>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "typeLithology",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, lithologySources),
    helperText: getOptionHelperText("typeLithology"),
    options: lithologySources,
    required: true
  },
  {
    property: "description",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("description", MaxLength.Comment)
  },
  {
    property: "mdTop",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdTop"),
    required: true
  },
  {
    property: "mdBottom",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdBottom"),
    required: true
  },
  {
    property: "tvdTop",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdTop")
  },
  {
    property: "tvdBase",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdBase")
  },
  {
    property: "ropAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("ropAv")
  },
  {
    property: "wobAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("wobAv")
  },
  {
    property: "tqAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tqAv")
  },
  {
    property: "currentAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("currentAv")
  },
  {
    property: "rpmAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("rpmAv")
  },
  {
    property: "wtMudAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("wtMudAv")
  },
  {
    property: "ecdTdAv",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("ecdTdAv")
  },
  {
    property: "dxcAv",
    propertyType: PropertyType.StringNumber,
    validator: validNumber,
    helperText: getNumberHelperText("dxcAv")
  },
  {
    property: "lithologies",
    propertyType: PropertyType.List,
    subProps: getLithologyProps(mode),
    itemPrefix: "Lithology "
  }
];

export const getLithologyProps = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Lithology>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "type",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, lithologyTypes),
    helperText: getOptionHelperText("type"),
    options: lithologyTypes
  },
  {
    property: "codeLith",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Str16),
    helperText: getMaxLengthHelperText("codeLith", MaxLength.Str16)
  },
  {
    property: "lithPc",
    propertyType: PropertyType.StringNumber,
    validator: validNumber,
    helperText: getNumberHelperText("lithPc")
  }
];
