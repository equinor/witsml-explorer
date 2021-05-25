import { createMuiTheme, Theme } from "@material-ui/core";
import { colors } from "./Colors";
import { UserTheme } from "../contexts/operationStateReducer";

const EquinorRegular = {
  fontFamily: "EquinorRegular"
};

const edsTheme = createMuiTheme({
  typography: {
    fontFamily: "EquinorRegular, Arial, sans-serif",
    fontSize: 14,
    h6: {
      fontSize: 16
    }
  },
  props: {
    MuiCheckbox: {
      disableRipple: true
    },
    MuiButtonBase: {
      disableRipple: true
    },
    MuiMenu: {
      getContentAnchorEl: null,
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "left"
      }
    }
  },
  palette: {
    secondary: {
      main: colors.interactive.dangerResting
    },
    primary: {
      main: colors.infographic.primaryMossGreen
    }
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        "@font-face": [EquinorRegular]
      }
    },
    MuiOutlinedInput: {
      notchedOutline: {
        borderRadius: 0
      }
    },
    MuiCheckbox: {
      colorSecondary: {
        "color": colors.infographic.primaryMossGreen,
        "&$checked": colors.infographic.primaryMossGreen
      },
      root: {
        "&:hover": {
          backgroundColor: "transparent"
        },
        "padding": "0"
      }
    },
    MuiSelect: {
      root: {
        paddingLeft: "0.5em"
      }
    },
    MuiFormControlLabel: {
      root: {
        lineHeight: "1em",
        marginBottom: 0
      }
    },
    MuiButton: {
      root: {
        "&:hover": {
          backgroundColor: colors.interactive.primaryHover
        },
        "backgroundColor": colors.infographic.primaryMossGreen,
        "color": colors.ui.backgroundDefault,
        "fontFamily": "EquinorMedium,Arial,sans-serif",
        "textTransform": "none",
        "fontSize": "1rem",
        "&:disabled": {
          backgroundColor: colors.interactive.disabledBorder
        }
      },
      containedPrimary: {
        "&:hover": {
          backgroundColor: colors.interactive.primaryHover
        },
        "backgroundColor": colors.infographic.primaryMossGreen
      },
      containedSecondary: {
        "&:hover": {
          backgroundColor: colors.interactive.dangerHover
        },
        "backgroundColor": colors.interactive.dangerResting
      },
      outlined: {
        backgroundColor: colors.ui.backgroundDefault
      }
    },
    MuiListItemIcon: {
      root: {
        minWidth: "24px"
      }
    },
    MuiTableSortLabel: {
      root: {
        "fontFamily": "EquinorMedium,Arial,sans-serif",
        "&& ": { color: colors.text.staticIconsDefault },
        "&:active": { color: colors.text.staticIconsDefault }
      }
    },
    MuiTableCell: {
      root: {
        lineHeight: "1.25rem",
        padding: "1rem 1rem 0.75rem 1rem"
      }
    },
    MuiDialogTitle: {
      root: {
        padding: "0.75em 1.5em"
      }
    },
    MuiDialogActions: {
      root: {
        "marginTop": "1em",
        "paddingLeft": 0,
        "justifyContent": "flex-start",
        "& .MuiButton-root": {
          marginLeft: 0
        }
      }
    },
    MuiMenuItem: {
      root: {
        padding: "0 1.5rem",
        margin: "0.75rem 0"
      }
    }
  }
});

const getTheme = (theme: UserTheme): Theme => {
  if (theme === UserTheme.Compact) {
    return createMuiTheme({
      ...edsTheme,
      props: {
        ...edsTheme.props,
        MuiCheckbox: {
          size: "small"
        }
      },
      overrides: {
        ...edsTheme.overrides,
        MuiTableCell: {
          root: {
            lineHeight: "1.25rem",
            padding: "0.5rem 0 0.25rem 1rem"
          }
        }
      }
    });
  } else {
    return createMuiTheme({
      ...edsTheme
    });
  }
};

export { getTheme };
