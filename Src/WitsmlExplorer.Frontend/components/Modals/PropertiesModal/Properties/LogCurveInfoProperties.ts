import { PropertiesModalMode, validText } from "components/Modals/ModalParts";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { getMaxLengthHelperText } from "components/Modals/PropertiesModal/ValidationHelpers";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import AxisDefinition from "models/AxisDefinition";
import LogCurveInfo from "models/logCurveInfo";
import MaxLength from "models/maxLength";

export const getLogCurveInfoProperties = (
  mode: PropertiesModalMode,
  isIndexCurve: boolean
): PropertiesModalProperty<LogCurveInfo>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "mnemonic",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("mnemonic", MaxLength.String32),
    disabled: isIndexCurve
  },
  {
    property: "unit",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.UomEnum),
    helperText: getMaxLengthHelperText("unit", MaxLength.UomEnum)
  },
  {
    property: "curveDescription",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText(
      "curveDescription",
      MaxLength.Description
    )
  },
  {
    property: "typeLogData",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "mnemAlias",
    propertyType: PropertyType.String,
    disabled: true
  },
  {
    property: "axisDefinitions",
    propertyType: PropertyType.List,
    subProps: getAxisDefinitionProps(mode),
    itemPrefix: "Axis Definition "
  }
];

export const getAxisDefinitionProps = (
  mode: PropertiesModalMode
): PropertiesModalProperty<AxisDefinition>[] => [
  {
    property: "uid",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Uid),
    helperText: getMaxLengthHelperText("uid", MaxLength.Uid),
    disabled: mode === PropertiesModalMode.Edit
  },
  {
    property: "order",
    propertyType: PropertyType.Number,
    disabled: true
  },
  {
    property: "count",
    propertyType: PropertyType.Number,
    disabled: true
  },
  {
    property: "doubleValues",
    propertyType: PropertyType.String,
    disabled: true
  }
];
