import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function EditIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/edit.svg"} alt="Edit" />
    </div>
  );
}
