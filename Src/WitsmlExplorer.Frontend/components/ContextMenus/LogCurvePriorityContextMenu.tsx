import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import { useOperationState } from "hooks/useOperationState";
import React from "react";
import { MousePosition } from "../../contexts/operationStateReducer";
import { preventContextMenuPropagation } from "./ContextMenu";
import { StyledIcon } from "./ContextMenuUtils";
import StyledMenu from "../StyledComponents/StyledMenu";

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
  const { colors } = useOperationState().operationState;

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
