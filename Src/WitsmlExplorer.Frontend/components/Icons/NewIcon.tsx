import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function NewIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/add.svg"} alt="New" />
    </div>
  );
}
