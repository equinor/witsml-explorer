import {
  PropertiesModalMode,
  validBoolean,
  validMeasure,
  validNumber,
  validOption,
  validText
} from "components/Modals/ModalParts";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getBooleanHelperText,
  getMaxLengthHelperText,
  getMeasureHelperText,
  getNumberHelperText,
  getOptionHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { holeCasingTypes } from "models/holeCasingTypes";
import MaxLength from "models/maxLength";
import WbGeometrySection from "models/wbGeometrySection";

export const getWbGeometrySectionProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<WbGeometrySection>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "typeHoleCasing",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, holeCasingTypes),
    helperText: getOptionHelperText("typeHoleCasing"),
    options: holeCasingTypes
  },
  {
    property: "mdTop",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdTop")
  },
  {
    property: "mdBottom",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdBottom")
  },
  {
    property: "tvdTop",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdTop")
  },
  {
    property: "tvdBottom",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdBottom")
  },
  {
    property: "idSection",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("idSection")
  },
  {
    property: "odSection",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("odSection")
  },
  {
    property: "wtPerLen",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("wtPerLen")
  },
  {
    property: "curveConductor",
    propertyType: PropertyType.Boolean,
    validator: validBoolean,
    helperText: getBooleanHelperText("curveConductor")
  },
  {
    property: "diaDrift",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("diaDrift")
  },
  {
    property: "grade",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("grade", MaxLength.String32)
  },
  {
    property: "factFric",
    propertyType: PropertyType.Number,
    validator: validNumber,
    helperText: getNumberHelperText("factFric")
  }
];
