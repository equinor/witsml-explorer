import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import React, { useMemo } from "react";
import { HideModalAction } from "../../contexts/operationStateReducer";
import OperationType from "../../contexts/operationType";
import ContextMenu from "./ContextMenu";
import { pluralize } from "./ContextMenuUtils";

export interface OptionsContextMenuProps {
  dispatchOperation: (action: HideModalAction) => void;
  options: string[];
  onOptionChange: (newValue: string) => void;
}

const OptionsContextMenu = (props: OptionsContextMenuProps): React.ReactElement => {
  const { dispatchOperation, options, onOptionChange } = props;

  const handleOptionChange = (option: string) => {
    dispatchOperation({ type: OperationType.HideModal });
    onOptionChange(option);
  };

  const menuItems = useMemo(() => {
    return options.map((option) => (
      <MenuItem key={option} onClick={() => handleOptionChange(option)}>
        <Typography color={"primary"}>{pluralize(option)}</Typography>
      </MenuItem>
    ));
  }, [options, onOptionChange]);

  return <ContextMenu menuItems={menuItems} />;
};

export default OptionsContextMenu;
