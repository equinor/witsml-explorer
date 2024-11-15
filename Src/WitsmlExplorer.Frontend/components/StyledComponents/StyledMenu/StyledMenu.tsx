import { FC } from "react";
import styled, { css } from "styled-components";
import { Colors } from "../../../styles/Colors.tsx";
import {
  buttonBaseClasses,
  Menu as MuiMenu,
  menuItemClasses,
  MenuProps,
  paperClasses
} from "@mui/material";
import { useOperationState } from "../../../hooks/useOperationState.tsx";
import { UserTheme } from "../../../contexts/operationStateReducer.tsx";

const StyledMenu: FC<MenuProps> = (props) => {
  const { colors, theme } = useOperationState().operationState;
  const sizeVariant: SizeVariant =
    theme === UserTheme.Compact ? UserTheme.Compact : "default";

  return (
    <RawStyledMenu {...props} colors={colors} $sizeVariant={sizeVariant} />
  );
};

export default StyledMenu;

type SizeVariant = UserTheme.Compact | "default";

const sizes: {
  [key in "default" | UserTheme.Compact]: {
    buttonBaseMargin?: string;
    menuItemFontSize?: string;
    menuItemIconSize?: string;
  };
} = {
  default: {
    buttonBaseMargin: undefined,
    menuItemFontSize: undefined,
    menuItemIconSize: undefined
  },
  compact: {
    buttonBaseMargin: "0",
    menuItemFontSize: "0.8rem",
    menuItemIconSize: "20px"
  }
};

const RawStyledMenu = styled(MuiMenu)<{
  colors: Colors;
  $sizeVariant: SizeVariant;
}>`
  ${({ colors, $sizeVariant }) => {
    const { infographic, ui, interactive } = colors;
    return css`
      .${paperClasses.root} {
        background: ${ui.backgroundLight};

        p {
          color: ${infographic.primaryMossGreen};
        }

        svg {
          fill: ${infographic.primaryMossGreen};
        }

        .${buttonBaseClasses.root}.${menuItemClasses.root} {
          margin: ${sizes[$sizeVariant].buttonBaseMargin};

          &,
          p {
            font-size: ${sizes[$sizeVariant].menuItemFontSize};
          }

          svg {
            height: ${sizes[$sizeVariant].menuItemIconSize};
            width: ${sizes[$sizeVariant].menuItemIconSize};
          }

          &:hover {
            text-decoration: none;
            background-color: ${interactive.contextMenuItemHover};
          }
        }
      }
    `;
  }}
`;
