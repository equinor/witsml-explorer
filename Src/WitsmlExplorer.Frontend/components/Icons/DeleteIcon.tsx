import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function DeleteIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/deleteToTrash.svg"} alt="Delete" />
    </div>
  );
}
