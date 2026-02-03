import {
  PropertiesModalMode,
  validText,
  validTimeZone
} from "components/Modals/ModalParts";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { PropertyType } from "components/Modals/PropertiesModal/PropertyTypes";
import {
  getMaxLengthHelperText,
  getTimeZoneHelperText
} from "components/Modals/PropertiesModal/ValidationHelpers";
import MaxLength from "models/maxLength";
import Well from "models/well";
import WellDatum from "../../../../models/wellDatum.tsx";
import ReferencePoint from "../../../../models/referencePoint.tsx";
import Location from "../../../../models/location.tsx";

export const getWellProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<Well>[] => [
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
    property: "field",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("field", MaxLength.Name)
  },
  {
    property: "country",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.String32),
    helperText: getMaxLengthHelperText("country", MaxLength.String32)
  },
  {
    property: "operator",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("operator", MaxLength.Name)
  },
  {
    property: "timeZone",
    propertyType: PropertyType.String,
    validator: (value: string) => validTimeZone(value),
    helperText: getTimeZoneHelperText("timeZone"),
    required: true
  },
  {
    property: "dateTimeLastChange",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "dateTimeCreation",
    propertyType: PropertyType.DateTime,
    disabled: true
  },
  {
    property: "waterDepth",
    propertyType: PropertyType.Measure,
    disabled: true
  },
  {
    property: "wellDatum",
    propertyType: PropertyType.List,
    subProps: getWellDatumProps(),
    itemPrefix: "Well Datum "
  },
  {
    property: "wellLocation",
    propertyType: PropertyType.List,
    subProps: getLocationProps(),
    itemPrefix: "Well Location "
  },
  {
    property: "referencePoint",
    propertyType: PropertyType.List,
    subProps: getReferencePointProps(),
    itemPrefix: "Reference Point "
  },
  {
    property: "numLicense",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Name),
    helperText: getMaxLengthHelperText("numLicense", MaxLength.Name)
  }
];

export const getWellDatumProps = (): PropertiesModalProperty<WellDatum>[] => [
  {
    property: "elevation",
    propertyType: PropertyType.Measure,
    disabled: true
  }
];

export const getReferencePointProps =
  (): PropertiesModalProperty<ReferencePoint>[] => [
    {
      property: "location",
      propertyType: PropertyType.List,
      subProps: getLocationProps(),
      itemPrefix: "Location "
    }
  ];

export const getLocationProps = (): PropertiesModalProperty<Location>[] => [
  {
    property: "latitude",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "longitude",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "easting",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "northing",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "westing",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "southing",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "projectedX",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "projectedY",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "localX",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  },
  {
    property: "localY",
    propertyType: PropertyType.Measure,
    disabled: true,
    hideIfEmpty: true
  }
];
