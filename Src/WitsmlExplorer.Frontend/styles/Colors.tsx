import { tokens } from "@equinor/eds-tokens";

export const light: Colors = {
  mode: "light",
  infographic: {
    primaryMossGreen: tokens.colors.infographic.primary__moss_green_100.hex
  },
  interactive: {
    dangerHighlight: tokens.colors.interactive.danger__highlight.hex,
    textHighlight: tokens.colors.interactive.text_highlight.hex,
    dangerHover: tokens.colors.interactive.danger__hover.hex,
    dangerResting: tokens.colors.interactive.danger__resting.hex,
    warningResting: tokens.colors.interactive.warning__resting.hex,
    disabledBorder: tokens.colors.interactive.disabled__border.hex,
    primaryHover: tokens.colors.interactive.primary__hover.hex,
    primaryResting: tokens.colors.interactive.primary__resting.hex,
    successResting: tokens.colors.interactive.success__resting.hex,
    tableHeaderFillResting:
      tokens.colors.interactive.table__header__fill_resting.hex,
    tableCellFillActivated:
      tokens.colors.interactive.table__cell__fill_activated.hex,
    successHover: tokens.colors.interactive.success__hover.hex,
    sidebarDivider: tokens.colors.interactive.primary__resting.hex,
    contextMenuItemHover: "",
    tableBorder: "#E0E0E0"
  },
  text: {
    staticIconsDefault: tokens.colors.text.static_icons__default.hex,
    staticIconsTertiary: tokens.colors.text.static_icons__tertiary.hex,
    staticCheckBoxDefault: tokens.colors.infographic.primary__moss_green_100,
    staticInactiveIndicator: "#DCDCDC",
    staticPropertyBarDefault: "#666666",
    staticPropertyKey: tokens.colors.text.static_icons__tertiary.hex,
    staticPropertyValue: tokens.colors.interactive.primary__resting.hex,
    staticTextFieldDefault: "#F7F7F7",
    staticTextLabel: "#999999",
    disabledText: tokens.colors.interactive.disabled__text.hex
  },
  ui: {
    backgroundDefault: tokens.colors.ui.background__default.hex,
    backgroundLight: tokens.colors.ui.background__light.hex
  }
};

export const dark: Colors = {
  mode: "dark",
  infographic: {
    primaryMossGreen: "#ffffff"
  },
  interactive: {
    dangerHighlight: "#FF667019",
    dangerHover: "#FF949B",
    dangerResting: tokens.colors.interactive.danger__resting.hex,
    warningResting: tokens.colors.interactive.warning__resting.hex,
    disabledBorder: "#3E4F5C",
    primaryHover: "#ADE2E6",
    primaryResting: "#97CACE",
    successResting: tokens.colors.interactive.success__resting.hex,
    tableHeaderFillResting: "#243746",
    tableCellFillActivated: "#007079",
    successHover: "#C1E7C1",
    sidebarDivider: "#243746",
    textHighlight: "#004F55",
    contextMenuItemHover: "#007079",
    tableBorder: "#007079"
  },
  text: {
    staticIconsDefault: "#FFFFFF",
    staticIconsTertiary: "#97CACE",
    staticCheckBoxDefault: "#AAAAAA",
    staticInactiveIndicator: "#6F6F6F",
    staticPropertyBarDefault: "#FFFFFF",
    staticPropertyKey: "#DEE5E7",
    staticPropertyValue: "#FFFFFF",
    staticTextFieldDefault: "transparent",
    staticTextLabel: "#CCCCCC",
    disabledText: tokens.colors.interactive.disabled__text.hex
  },
  ui: {
    backgroundDefault: "#132634",
    backgroundLight: "#243746"
  }
};

export const colors = light;
export interface Colors {
  mode: "light" | "dark";
  infographic: {
    primaryMossGreen: string;
  };
  interactive: {
    dangerHighlight: string;
    textHighlight: string;
    dangerHover: string;
    dangerResting: string;
    warningResting: string;
    disabledBorder: string;
    primaryHover: string;
    primaryResting: string;
    successResting: string;
    tableHeaderFillResting: string;
    tableCellFillActivated: string;
    successHover: string;
    sidebarDivider: string;
    contextMenuItemHover: string;
    tableBorder: string;
  };
  text: {
    staticIconsDefault: string;
    staticIconsTertiary: string;
    staticCheckBoxDefault: string | { hex: string; hsla: string; rgba: string };
    staticInactiveIndicator: string;
    staticPropertyBarDefault: string;
    staticPropertyKey: string;
    staticPropertyValue: string;
    staticTextFieldDefault: string;
    staticTextLabel: string;
    disabledText: string;
  };
  ui: {
    backgroundDefault: string;
    backgroundLight: string;
  };
}
