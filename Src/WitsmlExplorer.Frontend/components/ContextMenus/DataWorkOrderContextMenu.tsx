import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@mui/material";
import ContextMenu from "components/ContextMenus/ContextMenu";
import { StyledIcon } from "components/ContextMenus/ContextMenuUtils";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import React from "react";
import { colors } from "styles/Colors";

const DataWorkOrderContextMenu = (
  props: ObjectContextMenuProps
): React.ReactElement => {
  const { checkedObjects } = props;

  return (
    <ContextMenu
      menuItems={[
        <MenuItem key={"dummy"} disabled>
          <StyledIcon
            name="settings"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Context menu for ${checkedObjects
            ?.map((obj) => obj.name)
            .join(", ")}`}</Typography>
        </MenuItem>
      ]}
    />
  );
};

export default DataWorkOrderContextMenu;
