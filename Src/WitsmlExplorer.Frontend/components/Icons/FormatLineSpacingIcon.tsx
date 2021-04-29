import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function FormatLineSpacingIcon(): React.ReactElement {
  return (
    <div>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/formatLineSpacing.svg"} alt="Format line spacing" />
    </div>
  );
}
