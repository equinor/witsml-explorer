import * as React from "react";
import { AssetsLoader } from "../AssetsLoader";

export function IsActiveIcon(): React.ReactElement {
  return (
    <>
      <img src={AssetsLoader.getAssetsRoot() + "/assets/icons/trendingUp.svg"} alt="Is Active" />
    </>
  );
}
