import { CircularProgress } from "@equinor/eds-core-react";
import ContextMenu from "components/ContextMenus/ContextMenu";
import React from "react";

const LoadingContextMenu = (): React.ReactElement => {
  return (
    <ContextMenu
      menuItems={[
        <CircularProgress key="loading" size={32} style={{ margin: "8px" }} />
      ]}
    />
  );
};

export default LoadingContextMenu;
