import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function PasteIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/paste.svg"} alt="Paste" />
    </div>
  );
}
