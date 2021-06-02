import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function CopyIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/copy.svg"} alt="Copy" />
    </div>
  );
}
