import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function SettingsIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/settings.svg"} alt="Settings" />
    </div>
  );
}
