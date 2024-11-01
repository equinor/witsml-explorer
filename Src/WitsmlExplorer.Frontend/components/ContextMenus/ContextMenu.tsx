import { MousePosition } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOperationState } from "hooks/useOperationState";
import React, { ReactElement } from "react";
import StyledMenu from "../StyledComponents/StyledMenu";

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
  const { operationState, dispatchOperation } = useOperationState();
  const { contextMenu } = operationState;

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
    >
      {props.menuItems}
    </StyledMenu>
  );
};

export default ContextMenu;
