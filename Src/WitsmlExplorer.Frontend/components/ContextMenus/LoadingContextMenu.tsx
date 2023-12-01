import { CircularProgress } from "@equinor/eds-core-react";
import React from "react";
import ContextMenu from "./ContextMenu";

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
