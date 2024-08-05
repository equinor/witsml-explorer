import {
  PropertiesModalMode,
  validMeasure,
  validOption,
  validStratigraphicStruct,
  validText
} from "components/Modals/ModalParts";
import { getCommonObjectOnWellboreProperties } from "components/Modals/PropertiesModal/Properties/CommonObjectOnWellboreProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getMeasureHelperText,
  getOptionHelperText,
  getStratigraphicStructHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import FormationMarker from "models/formationMarker";
import { itemStateTypes } from "models/itemStateTypes";
import MaxLength from "models/maxLength";

export const getFormationMarkerProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<FormationMarker>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "commonData.itemState",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, itemStateTypes),
    helperText: getOptionHelperText("itemState"),
    options: itemStateTypes
  },
  {
    property: "mdPrognosed",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdPrognosed")
  },
  {
    property: "tvdPrognosed",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdPrognosed")
  },
  {
    property: "mdTopSample",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdTopSample"),
    required: true
  },
  {
    property: "tvdTopSample",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdTopSample")
  },
  {
    property: "thicknessBed",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("thicknessBed")
  },
  {
    property: "thicknessPerpen",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("thicknessPerpen")
  },
  {
    property: "mdLogSample",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("mdLogSample")
  },
  {
    property: "tvdLogSample",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("tvdLogSample")
  },
  {
    property: "dip",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("dip")
  },
  {
    property: "dipDirection",
    propertyType: PropertyType.Measure,
    validator: validMeasure,
    helperText: getMeasureHelperText("dipDirection")
  },
  {
    property: "lithostratigraphic",
    propertyType: PropertyType.StratigraphicStruct,
    validator: validStratigraphicStruct,
    helperText: getStratigraphicStructHelperText("lithostratigraphic")
  },
  {
    property: "chronostratigraphic",
    propertyType: PropertyType.StratigraphicStruct,
    validator: validStratigraphicStruct,
    helperText: getStratigraphicStructHelperText("chronostratigraphic")
  },
  {
    property: "description",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Description),
    helperText: getMaxLengthHelperText("description", MaxLength.Description)
  }
];
