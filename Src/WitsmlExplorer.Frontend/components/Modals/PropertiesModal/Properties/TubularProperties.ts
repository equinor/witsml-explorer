import { PropertiesModalMode, validOption } from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import { getOptionHelperText } from "components/Modals/PropertiesModal/ValidationHelpers";
import Tubular from "models/tubular";
import { typeTubularAssy } from "models/typeTubularAssy";

export const getTubularProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Tubular>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "typeTubularAssy",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, typeTubularAssy),
    helperText: getOptionHelperText("typeTubularAssy"),
    options: typeTubularAssy,
    required: true
  }
];
