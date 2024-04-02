import { Menu } from "@mui/material";
import OperationContext from "contexts/operationContext";
import { MousePosition } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import React, { ReactElement, useContext } from "react";
import styled from "styled-components";
import { Colors } from "styles/Colors";

interface ContextMenuProps {
  menuItems: ReactElement[];
}

export const preventContextMenuPropagation = (
  event: React.MouseEvent<HTMLLIElement | HTMLDivElement>
): boolean => {
  event.preventDefault();
  event.stopPropagation();
  return false;
};

export const getContextMenuPosition = (
  event: React.MouseEvent<HTMLLIElement | HTMLDivElement | HTMLButtonElement>
): MousePosition => {
  return { mouseX: event.clientX - 2, mouseY: event.clientY - 2 };
};

const ContextMenu = (props: ContextMenuProps): React.ReactElement => {
  const { operationState, dispatchOperation } = useContext(OperationContext);
  const { contextMenu, colors } = operationState;

  const handleClose = () => {
    dispatchOperation({ type: OperationType.HideContextMenu });
  };

  return (
    <StyledMenu
      keepMounted
      open={contextMenu.position.mouseY !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu.position.mouseY !== null &&
        contextMenu.position.mouseX !== null
          ? {
              top: contextMenu.position.mouseY,
              left: contextMenu.position.mouseX
            }
          : undefined
      }
      onContextMenu={preventContextMenuPropagation}
      colors={colors}
    >
      {props.menuItems}
    </StyledMenu>
  );
};

export const StyledMenu = styled(Menu)<{ colors: Colors }>`
  .MuiPaper-root {
    background: ${(props) => props.colors.ui.backgroundLight};
    p {
      color: ${(props) => props.colors.infographic.primaryMossGreen};
    }
    svg {
      fill: ${(props) => props.colors.infographic.primaryMossGreen};
    }
    .MuiListItem-button:hover {
      text-decoration: none;
      background-color: ${(props) =>
        props.colors.interactive.contextMenuItemHover};
    }
  }
`;

export default ContextMenu;
