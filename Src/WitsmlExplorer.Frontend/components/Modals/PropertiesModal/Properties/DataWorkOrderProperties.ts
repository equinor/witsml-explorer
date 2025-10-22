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
import DataWorkOrder from "models/dataWorkOrder/dataWorkOrder";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";

export const getDataWorkOrderProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<DataWorkOrder>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "field",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name)
  },
  {
    property: "dataProvider",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name)
  },
  {
    property: "dataConsumer",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name)
  },
  {
    property: "description",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment)
  },
  {
    property: "dTimPlannedStart",
    propertyType: PropertyType.DateTime
  },
  {
    property: "dTimPlannedStop",
    propertyType: PropertyType.DateTime
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
