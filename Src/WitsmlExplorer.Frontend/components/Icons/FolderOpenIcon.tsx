import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function FolderOpenIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/folderOpen.svg"} alt="Open folder" />
    </div>
  );
}
