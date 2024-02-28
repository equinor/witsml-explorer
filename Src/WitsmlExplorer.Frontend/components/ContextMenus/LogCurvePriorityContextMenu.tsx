import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useContext } from "react";
import OperationContext from "../../contexts/operationContext";
import { MousePosition } from "../../contexts/operationStateReducer";
import { StyledMenu, preventContextMenuPropagation } from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";

export interface LogCurvePriorityContextMenuProps {
  onDelete: () => void;
  onClose: () => void;
  position: MousePosition;
  open: boolean;
}

export const LogCurvePriorityContextMenu = (
  props: LogCurvePriorityContextMenuProps
): React.ReactElement => {
  const { onDelete, onClose, position, open } = props;
  const { operationState } = useContext(OperationContext);
  const { colors } = operationState;

  const onClickDelete = async () => {
    onDelete();
    onClose();
  };

  return (
    <StyledMenu
      disablePortal
      keepMounted
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        position.mouseY !== null && position.mouseX !== null
          ? {
              top: position.mouseY,
              left: position.mouseX
            }
          : undefined
      }
      onContextMenu={preventContextMenuPropagation}
      colors={colors}
    >
      <MenuItem key={"delete"} onClick={onClickDelete}>
        <StyledIcon
          name="deleteToTrash"
          color={colors.interactive.primaryResting}
        />
        <Typography color={"primary"}>Remove From Priority</Typography>
      </MenuItem>
    </StyledMenu>
  );
};
