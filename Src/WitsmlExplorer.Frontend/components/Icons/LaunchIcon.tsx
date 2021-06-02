import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function LaunchIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/launch.svg"} alt="Launch" />
    </div>
  );
}
