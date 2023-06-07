import { tokens } from "@equinor/eds-tokens";

export const colors = {
  infographic: {
    primaryMossGreen: tokens.colors.infographic.primary__moss_green_100.hex
  },
  interactive: {
    dangerHighlight: tokens.colors.interactive.danger__highlight.hex,
    textHighlight: tokens.colors.interactive.text_highlight.hex,
    dangerHover: tokens.colors.interactive.danger__hover.hex,
    dangerResting: tokens.colors.interactive.danger__resting.hex,
    disabledBorder: tokens.colors.interactive.disabled__border.hex,
    primaryHover: tokens.colors.interactive.primary__hover.hex,
    primaryResting: tokens.colors.interactive.primary__resting.hex,
    successResting: tokens.colors.interactive.success__resting.hex,
    tableHeaderFillResting: tokens.colors.interactive.table__header__fill_resting.hex,
    tableCellFillActivated: tokens.colors.interactive.table__cell__fill_activated.hex,
    successHover: tokens.colors.interactive.success__hover.hex
  },
  text: {
    staticIconsDefault: tokens.colors.text.static_icons__default.hex,
    staticIconsTertiary: tokens.colors.text.static_icons__tertiary.hex
  },
  ui: {
    backgroundDefault: tokens.colors.ui.background__default.hex,
    backgroundLight: tokens.colors.ui.background__light.hex
  }
};
