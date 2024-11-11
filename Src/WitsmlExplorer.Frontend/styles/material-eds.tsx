import {
  buttonClasses,
  createTheme,
  Theme,
  typographyClasses
} from "@mui/material";
import { UserTheme } from "contexts/operationStateReducer";
import { colors } from "styles/Colors";
import { isInAnyCompactMode } from "../tools/themeHelpers.ts";

const EquinorRegular = {
  fontFamily: "EquinorRegular"
};

const edsTheme = createTheme({
  typography: {
    fontFamily: "EquinorRegular, Arial, sans-serif",
    fontSize: 14,
    h6: {
      fontSize: 16
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          "@font-face": [EquinorRegular]
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderRadius: 0
        }
      }
    },
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        colorSecondary: {
          "color": colors.infographic.primaryMossGreen,
          "&.Mui-checked": colors.infographic.primaryMossGreen
        },
        root: {
          "&:hover": {
            backgroundColor: "transparent"
          },
          "padding": "0"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: colors.interactive.primaryHover
          },
          "backgroundColor": colors.infographic.primaryMossGreen,
          "color": colors.ui.backgroundDefault,
          "fontFamily": "EquinorMedium,Arial,sans-serif",
          "textTransform": "none",
          "fontSize": "1rem",
          "&.Mui-disabled": {
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
      }
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left"
        }
      }
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          lineHeight: "1em",
          marginBottom: 0
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "24px"
        }
      }
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          "fontFamily": "EquinorMedium,Arial,sans-serif",
          "color": colors.text.staticIconsDefault,
          "&:active": {
            color: colors.text.staticIconsDefault
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          lineHeight: "1.25rem",
          padding: "1rem 1rem 0.75rem 1rem"
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "0.75em 1.5em"
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          "marginTop": "1em",
          "paddingLeft": 0,
          "justifyContent": "flex-start",
          "& .MuiButton-root": {
            marginLeft: 0
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: "0.35rem 1.5rem",
          margin: "0.75rem 0"
        }
      }
    }
  },
  zIndex: {
    modal: 49
  }
});

const getTheme = (theme: UserTheme): Theme => {
  let themeOverrides = {};
  if (isInAnyCompactMode(theme)) {
    themeOverrides = {
      ...edsTheme,
      components: {
        ...edsTheme.components,
        MuiCheckbox: {
          ...edsTheme.components.MuiCheckbox,
          defaultProps: {
            ...edsTheme.components.MuiCheckbox.defaultProps,
            size: "small"
          }
        },
        MuiTableCell: {
          ...edsTheme.components.MuiTableCell,
          styleOverrides: {
            ...edsTheme.components.MuiTableCell.styleOverrides,
            root: {
              // @ts-ignore
              ...edsTheme.components.MuiTableCell.styleOverrides.root,
              lineHeight: "1.25rem",
              padding: "0.25rem"
            }
          }
        },
        MuiButton: {
          ...edsTheme.components.MuiButton,
          styleOverrides:
            theme !== UserTheme.Compact
              ? edsTheme.components.MuiButton.styleOverrides
              : {
                  root: {
                    // @ts-ignore
                    ...edsTheme.components.MuiButton.styleOverrides.root,
                    padding: "0.2rem 1rem",
                    textTransform: "initial",
                    width: "fit-content !important",
                    minWidth: "fit-content !important",
                    fontSize: "0.85rem",
                    whiteSpace: "nowrap",
                    [`.${typographyClasses.root}`]: {
                      fontSize: "0.85rem"
                    },
                    [`span.${buttonClasses.icon} svg`]: {
                      height: "20px",
                      width: "20px"
                    }
                  }
                }
        }
      }
    };
  }
  return createTheme({
    ...edsTheme,
    ...themeOverrides
  });
};
export { getTheme };
