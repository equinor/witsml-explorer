import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function RefreshIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/refresh.svg"} alt="Refresh" />
    </div>
  );
}
