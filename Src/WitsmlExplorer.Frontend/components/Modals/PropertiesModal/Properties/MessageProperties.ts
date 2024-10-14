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
import MaxLength from "models/maxLength";
import MessageObject from "models/messageObject";
import { messageTypes } from "models/messageTypes";

export const getMessageProperties = (
  mode: PropertiesModalMode
): PropertiesModalProperty<MessageObject>[] => [
  ...getCommonObjectOnWellboreProperties(mode),
  {
    property: "dTim",
    propertyType: PropertyType.DateTime,
    required: true,
    disabled: mode !== PropertiesModalMode.New
  },
  {
    property: "typeMessage",
    propertyType: PropertyType.Options,
    validator: (value: string) => validOption(value, messageTypes),
    helperText: getOptionHelperText("typeMessage"),
    options: messageTypes,
    required: true,
    disabled: mode !== PropertiesModalMode.New
  },
  {
    property: "messageText",
    propertyType: PropertyType.String,
    validator: (value: string) => validText(value, 1, MaxLength.Comment),
    helperText: getMaxLengthHelperText("messageText", MaxLength.Comment),
    multiline: true
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
